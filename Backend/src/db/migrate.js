/**
 * RoadSense Migration Runner
 * Idempotent — safe to run multiple times.
 * Run: node --env-file=.env src/db/migrate.js
 */
import { createDatabase } from "./postgres.js";


async function runMigration(config = process.env) {
  const sql = createDatabase(config);

  console.log("🔄 Connecting to database...");
  await sql`SELECT 1`;

  // ──────────────────────────────────────────────────
  // BLOCK 1 — Existing columns (keep idempotent)
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 1: Ensuring existing report columns...");

  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) NOT NULL DEFAULT 'image';`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS description TEXT;`);
  await sql.unsafe(`ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_image_mime_type_check;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS support_count INTEGER NOT NULL DEFAULT 0;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT NOT NULL DEFAULT 0;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS s3_object_key TEXT;`);
  await sql.unsafe(`ALTER TABLE reports ALTER COLUMN raw_ai_response TYPE JSON USING CASE WHEN raw_ai_response IS NULL THEN NULL ELSE raw_ai_response::json END;`);
  console.log("  ✅ Existing report columns ensured");

  // ──────────────────────────────────────────────────
  // BLOCK 2 — Expand reports.status CHECK constraint
  // The old constraint only allowed: notStarted, onGoing, completed
  // New lifecycle adds: BIDDING, ASSIGNED, IN_PROGRESS, VERIFICATION, ESCALATED, DELETED
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 2: Expanding reports.status constraint for full lifecycle...");

  await sql.unsafe(`ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;`);
  await sql.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'reports_status_lifecycle_check'
          AND conrelid = 'reports'::regclass
      ) THEN
        ALTER TABLE reports ADD CONSTRAINT reports_status_lifecycle_check
          CHECK (status IN (
            'notStarted', 'onGoing', 'completed',
            'BIDDING', 'ASSIGNED', 'IN_PROGRESS',
            'VERIFICATION', 'ESCALATED', 'DELETED'
          ));
      END IF;
    END;
    $$;
  `);
  console.log("  ✅ reports.status constraint expanded");

  // ──────────────────────────────────────────────────
  // ──────────────────────────────────────────────────
  // BLOCK 3 — New lifecycle columns on reports
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 3: Adding lifecycle columns to reports...");

  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS assigned_worker_id UUID;`);
  // Remove FK constraint on assigned_worker_id if present so it can reference either users or worker_groups
  await sql.unsafe(`ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_assigned_worker_id_fkey;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS bidding_started_at TIMESTAMPTZ;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS bidding_ends_at TIMESTAMPTZ;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;`);
  await sql.unsafe(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS verification_ends_at TIMESTAMPTZ;`);

  await sql.unsafe(`CREATE INDEX IF NOT EXISTS reports_assigned_worker_idx ON reports (assigned_worker_id);`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS reports_bidding_ends_at_idx ON reports (bidding_ends_at) WHERE status = 'BIDDING';`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS reports_verification_ends_at_idx ON reports (verification_ends_at) WHERE status IN ('VERIFICATION', 'COMPLETED');`);
  console.log("  ✅ reports lifecycle columns + indexes added");

  // ──────────────────────────────────────────────────
  // BLOCK 4 — Existing junction tables
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 4: Ensuring existing junction tables...");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS report_supports (
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS report_supports_user_id_idx ON report_supports (user_id);
  `);
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS report_detections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      damage_class VARCHAR(50) NOT NULL,
      confidence NUMERIC(6, 5) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
      bbox JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS report_detections_report_id_idx ON report_detections (report_id);
  `);
  console.log("  ✅ report_supports and report_detections ensured");

  // ──────────────────────────────────────────────────
  // BLOCK 5 — Bids table
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 5: Creating bids table...");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS bids (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      worker_id   UUID NOT NULL,
      status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_active_bid_per_worker UNIQUE (report_id, worker_id)
    );
    -- Drop FK on worker_id if it exists from older schema so both users & worker_groups can bid
    ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_worker_id_fkey;
    ALTER TABLE bids ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2);
    CREATE INDEX IF NOT EXISTS bids_report_id_idx ON bids (report_id);
    CREATE INDEX IF NOT EXISTS bids_worker_id_idx ON bids (worker_id);
    CREATE INDEX IF NOT EXISTS bids_status_idx ON bids (status);
    CREATE INDEX IF NOT EXISTS bids_report_amount_idx ON bids (report_id, amount ASC);
  `);
  console.log("  ✅ bids table created & amount column ensured");

  // ──────────────────────────────────────────────────
  // BLOCK 6 — Verification votes table
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 6: Creating report_verifications vote pool table...");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS report_verifications (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      result      VARCHAR(20) NOT NULL CHECK (result IN ('COMPLETED', 'NOT_COMPLETED')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_vote_per_user UNIQUE (report_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS verifications_report_id_idx ON report_verifications (report_id);
  `);
  console.log("  ✅ report_verifications table created");

  // ──────────────────────────────────────────────────
  // BLOCK 7 — Admin issues table
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 7: Creating admin_issues table...");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS admin_issues (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id   UUID REFERENCES reports(id) ON DELETE SET NULL,
      worker_id   UUID,
      user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
      type        VARCHAR(50) NOT NULL DEFAULT 'WORK_NOT_COMPLETED',
      description TEXT,
      status      VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMPTZ
    );
    ALTER TABLE admin_issues DROP CONSTRAINT IF EXISTS admin_issues_worker_id_fkey;
    CREATE INDEX IF NOT EXISTS admin_issues_status_idx ON admin_issues (status);
    CREATE INDEX IF NOT EXISTS admin_issues_report_id_idx ON admin_issues (report_id);
  `);
  console.log("  ✅ admin_issues table created");

  // ──────────────────────────────────────────────────
  // BLOCK 8 — Worker management on users table
  // Add is_active flag to allow admin to deactivate workers
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 8: Adding is_active column to users for worker management...");

  await sql.unsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;`);
  console.log("  ✅ users.is_active column ensured");

  // ──────────────────────────────────────────────────
  // BLOCK 9 — Existing spatial + status indexes
  // ──────────────────────────────────────────────────
  console.log("\n📋 Block 9: Ensuring general indexes...");

  await sql.unsafe(`CREATE INDEX IF NOT EXISTS reports_location_idx ON reports USING GIST (location);`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);`);
  await sql.unsafe(`CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx ON reports (user_id, created_at DESC);`);
  console.log("  ✅ General indexes ensured");

  console.log("\n🎉 Migration complete — all tables and columns are up to date.");
  await sql.end();
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  });

