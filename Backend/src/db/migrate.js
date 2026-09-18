/**
 * One-time migration: add missing columns to the reports table
 * Run: node --env-file=.env src/db/migrate.js
 */
import { createDatabase } from "./postgres.js";

async function runMigration(config = process.env) {
  const sql = createDatabase(config);

  console.log("🔄 Connecting to database...");
  await sql`SELECT 1`;

  console.log("📋 Running migration: add media_type and related columns to reports...");

  // Add media_type column (this is the one causing the failure)
  await sql.unsafe(`
    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) NOT NULL DEFAULT 'image'
        CHECK (media_type IN ('image', 'video'));
  `);
  console.log("  ✅ media_type column ensured");

  // Add description column in case it's missing
  await sql.unsafe(`
    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS description TEXT;
  `);
  console.log("  ✅ description column ensured");

  // Widen image_mime_type check to allow video MIME types
  await sql.unsafe(`
    ALTER TABLE reports
      DROP CONSTRAINT IF EXISTS reports_image_mime_type_check;
  `);
  console.log("  ✅ MIME type constraint dropped (now allows image/* and video/*)");

  // Add support_count column in case it's missing
  await sql.unsafe(`
    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS support_count INTEGER NOT NULL DEFAULT 0;
  `);
  console.log("  ✅ support_count column ensured");

  // Ensure raw_ai_response is JSON type
  await sql.unsafe(`
    ALTER TABLE reports
      ALTER COLUMN raw_ai_response TYPE JSON
        USING CASE WHEN raw_ai_response IS NULL THEN NULL
                   ELSE raw_ai_response::json END;
  `);
  console.log("  ✅ raw_ai_response column type ensured");

  // Ensure file_size_bytes column exists
  await sql.unsafe(`
    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT NOT NULL DEFAULT 0;
  `);
  console.log("  ✅ file_size_bytes column ensured");

  // Add s3_object_key unique index in case it's missing
  await sql.unsafe(`
    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS s3_object_key TEXT;
  `);
  console.log("  ✅ s3_object_key column ensured");

  // Ensure report_supports junction table exists
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS report_supports (
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS report_supports_user_id_idx
      ON report_supports (user_id);
  `);
  console.log("  ✅ report_supports table ensured");

  // Ensure report_detections table exists
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS report_detections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      damage_class VARCHAR(50) NOT NULL,
      confidence NUMERIC(6, 5) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
      bbox JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS report_detections_report_id_idx
      ON report_detections (report_id);
  `);
  console.log("  ✅ report_detections table ensured");

  // GIST index on location for spatial queries
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS reports_location_idx
      ON reports USING GIST (location);
  `);
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS reports_status_idx
      ON reports (status);
  `);
  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx
      ON reports (user_id, created_at DESC);
  `);
  console.log("  ✅ Indexes ensured");

  console.log("\n🎉 Migration complete — reports table is up to date.");
  await sql.end();
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  });
