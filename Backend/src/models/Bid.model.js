// Defines the bids table for municipal road repairs bidding system

export const bidSchema = {
  tableName: "bids",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    report_id: { type: "UUID", required: true, references: "reports(id)" },
    worker_id: { type: "UUID", required: true }, // Can reference users(id) [WORKER] or worker_groups(id) [WORKER_GROUP]
    status: {
      type: "VARCHAR(20)",
      required: true,
      default: "ACTIVE",
      enum: ["ACTIVE", "ACCEPTED", "REJECTED", "EXPIRED"],
    },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
    updated_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS bids (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      worker_id UUID NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_active_bid_per_worker UNIQUE (report_id, worker_id)
    );

    ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_worker_id_fkey;

    CREATE INDEX IF NOT EXISTS bids_report_id_idx ON bids (report_id);
    CREATE INDEX IF NOT EXISTS bids_worker_id_idx ON bids (worker_id);
    CREATE INDEX IF NOT EXISTS bids_status_idx ON bids (status);
  `,
};

export default bidSchema;
