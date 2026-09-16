// Defines worker groups, their members, and the reports they handle

export const workerSchema = {
  tableName: "worker_groups",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    name: { type: "VARCHAR(255)", required: true },
    description: { type: "TEXT", default: null },
    status: {
      type: "VARCHAR(20)",
      default: "DRAFT",
      enum: ["DRAFT", "ACTIVE"],
    },
    created_by: { type: "UUID", required: true, references: "users(id)" },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS worker_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ACTIVE')),
      created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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

    CREATE OR REPLACE FUNCTION validate_worker_group_member()
    RETURNS trigger AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = NEW.worker_id AND role = 'WORKER'
      ) THEN
        RAISE EXCEPTION 'Only WORKER users can join a worker group';
      END IF;

      IF (
        SELECT COUNT(*)
        FROM worker_group_members
        WHERE worker_group_id = NEW.worker_group_id
      ) >= 7 THEN
        RAISE EXCEPTION 'A worker group cannot contain more than 7 workers';
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS worker_group_member_validation
      ON worker_group_members;

    CREATE TRIGGER worker_group_member_validation
      BEFORE INSERT ON worker_group_members
      FOR EACH ROW EXECUTE FUNCTION validate_worker_group_member();

    CREATE OR REPLACE FUNCTION validate_active_worker_group()
    RETURNS trigger AS $$
    BEGIN
      IF NEW.status = 'ACTIVE' AND (
        SELECT COUNT(*)
        FROM worker_group_members
        WHERE worker_group_id = NEW.id
      ) < 2 THEN
        RAISE EXCEPTION 'An active worker group must contain at least 2 workers';
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS active_worker_group_validation
      ON worker_groups;

    CREATE TRIGGER active_worker_group_validation
      BEFORE UPDATE OF status ON worker_groups
      FOR EACH ROW EXECUTE FUNCTION validate_active_worker_group();

    CREATE OR REPLACE FUNCTION validate_worker_group_member_removal()
    RETURNS trigger AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM worker_groups
        WHERE id = OLD.worker_group_id AND status = 'ACTIVE'
      ) AND (
        SELECT COUNT(*)
        FROM worker_group_members
        WHERE worker_group_id = OLD.worker_group_id
      ) <= 2 THEN
        RAISE EXCEPTION 'An active worker group must contain at least 2 workers';
      END IF;

      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS active_worker_group_member_removal_validation
      ON worker_group_members;

    CREATE TRIGGER active_worker_group_member_removal_validation
      BEFORE DELETE ON worker_group_members
      FOR EACH ROW EXECUTE FUNCTION validate_worker_group_member_removal();
  `,
};

export default workerSchema;
