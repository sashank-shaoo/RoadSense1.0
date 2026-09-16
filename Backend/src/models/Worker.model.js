// Defines worker groups, their members, and the reports they handle

export const workerSchema = {
  tableName: "worker_groups",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    name: { type: "VARCHAR(255)", required: true },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS worker_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      CONSTRAINT worker_group_name_unique UNIQUE (name)
    );

    CREATE TABLE IF NOT EXISTS worker_group_members (
      worker_group_id UUID NOT NULL REFERENCES worker_groups(id) ON DELETE CASCADE,
      worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (worker_group_id, worker_id)
    );

    CREATE TABLE IF NOT EXISTS worker_report_assignments (
      report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
      worker_group_id UUID NOT NULL REFERENCES worker_groups(id) ON DELETE RESTRICT,
      assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      work_notes TEXT,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS worker_group_members_worker_id_idx
      ON worker_group_members (worker_id);

    CREATE INDEX IF NOT EXISTS worker_report_assignments_group_id_idx
      ON worker_report_assignments (worker_group_id);

    DROP TRIGGER IF EXISTS worker_group_member_validation
      ON worker_group_members;

    DROP TRIGGER IF EXISTS active_worker_group_validation
      ON worker_groups;

    DROP TRIGGER IF EXISTS active_worker_group_member_removal_validation
      ON worker_group_members;

    DROP FUNCTION IF EXISTS validate_worker_group_member();
    DROP FUNCTION IF EXISTS validate_active_worker_group();
    DROP FUNCTION IF EXISTS validate_worker_group_member_removal();

    ALTER TABLE worker_groups
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS status,
      DROP COLUMN IF EXISTS created_by,
      DROP COLUMN IF EXISTS created_at;
  `,
};

export default workerSchema;
