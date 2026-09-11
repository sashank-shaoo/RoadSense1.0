// Defines the reports table stored in the AWS RDS PostgreSQL database

export const reportSchema = {
  tableName: "reports",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    user_id: { type: "UUID", required: true, references: "users(id)" },
    image_mime_type: { type: "VARCHAR(100)", required: true },
    original_filename: { type: "VARCHAR(255)", required: true },
    s3_object_key: { type: "TEXT", required: true, unique: true },
    file_size_bytes: { type: "BIGINT", required: true },
    location: { type: "GEOGRAPHY(POINT, 4326)", required: true },
    location_confirmed: { type: "BOOLEAN", default: false },
    status: {
      type: "VARCHAR(30)",
      default: "notStarted",
      enum: ["notStarted", "onGoing", "completed"],
    },
    processing_status: {
      type: "VARCHAR(30)",
      default: "PENDING",
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    },
    failure_reason: { type: "TEXT", default: null },
    detection_count: { type: "INTEGER", default: null },
    highest_severity: { type: "VARCHAR(50)", default: null },
    damage_score: { type: "NUMERIC(10, 4)", default: null },
    raw_ai_response: { type: "JSONB", default: null },
    ai_model_version: { type: "VARCHAR(100)", default: null },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
    updated_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
    processed_at: { type: "TIMESTAMPTZ", default: null },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS postgis;

    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      image_mime_type VARCHAR(100) NOT NULL
        CHECK (image_mime_type LIKE 'image/%'),
      original_filename VARCHAR(255) NOT NULL,
      s3_object_key TEXT NOT NULL UNIQUE,
      file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
      location GEOGRAPHY(POINT, 4326) NOT NULL,
      location_confirmed BOOLEAN NOT NULL DEFAULT false,
      status VARCHAR(30) NOT NULL DEFAULT 'notStarted'
        CHECK (status IN ('notStarted', 'onGoing', 'completed')),
      processing_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
      failure_reason TEXT,
      detection_count INTEGER CHECK (detection_count >= 0),
      highest_severity VARCHAR(50),
      damage_score NUMERIC(10, 4),
      raw_ai_response JSONB,
      ai_model_version VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx
      ON reports (user_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS reports_status_idx
      ON reports (status);

    CREATE INDEX IF NOT EXISTS reports_location_idx
      ON reports USING GIST (location);
  `,
};

export default reportSchema;
