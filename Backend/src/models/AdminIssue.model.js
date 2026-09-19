// Defines the admin_issues table for tracking reported repair discrepancies and escalation issues

export const adminIssueSchema = {
  tableName: "admin_issues",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    report_id: { type: "UUID", references: "reports(id)" },
    worker_id: { type: "UUID" }, // Can reference users(id) [WORKER] or worker_groups(id) [WORKER_GROUP]
    user_id: { type: "UUID", references: "users(id)" },
    type: {
      type: "VARCHAR(50)",
      required: true,
      default: "WORK_NOT_COMPLETED",
    },
    description: { type: "TEXT" },
    status: {
      type: "VARCHAR(20)",
      required: true,
      default: "OPEN",
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
    },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
    resolved_at: { type: "TIMESTAMPTZ", default: null },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS admin_issues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
      worker_id UUID,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'WORK_NOT_COMPLETED',
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMPTZ
    );

    ALTER TABLE admin_issues DROP CONSTRAINT IF EXISTS admin_issues_worker_id_fkey;

    CREATE INDEX IF NOT EXISTS admin_issues_status_idx ON admin_issues (status);
    CREATE INDEX IF NOT EXISTS admin_issues_report_id_idx ON admin_issues (report_id);
    CREATE INDEX IF NOT EXISTS admin_issues_worker_id_idx ON admin_issues (worker_id);
  `,
};

export default adminIssueSchema;
