// Defines the AI detections table stored in the AWS RDS PostgreSQL database

export const reportDetectionSchema = {
  tableName: "report_detections",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    report_id: { type: "UUID", required: true, references: "reports(id)" },
    damage_class: { type: "VARCHAR(50)", required: true },
    confidence: { type: "NUMERIC(6, 5)", required: true },
    bbox: { type: "JSONB", required: true },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  `,
};

export default reportDetectionSchema;
