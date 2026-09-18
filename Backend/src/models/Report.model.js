// Defines the reports table stored in the AWS RDS PostgreSQL database

export const reportSchema = {
  tableName: "reports",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    user_id: { type: "UUID", required: true, references: "users(id)" },
    media_type: {
      type: "VARCHAR(20)",
      required: true,
      default: "image",
      enum: ["image", "video"],
    },
    image_mime_type: { type: "VARCHAR(100)", required: true },
    original_filename: { type: "VARCHAR(255)", required: true },
    description: { type: "TEXT", default: null },
    s3_object_key: { type: "TEXT", required: true, unique: true },
    file_size_bytes: { type: "BIGINT", required: true },
    location: { type: "GEOGRAPHY(POINT, 4326)", required: true },
    status: {
      type: "VARCHAR(30)",
      default: "notStarted",
      enum: ["notStarted", "onGoing", "completed"],
    },
    detection_count: { type: "INTEGER", default: null },
    highest_severity: { type: "VARCHAR(50)", default: null },
    damage_score: { type: "NUMERIC(10, 4)", default: null },
    raw_ai_response: { type: "JSON", default: null },
    support_count: { type: "INTEGER", required: true, default: 0 },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS postgis;

    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_type VARCHAR(20) NOT NULL DEFAULT 'image'
        CHECK (media_type IN ('image', 'video')),
      image_mime_type VARCHAR(100) NOT NULL
        CHECK (image_mime_type LIKE 'image/%' OR image_mime_type LIKE 'video/%'),
      original_filename VARCHAR(255) NOT NULL,
      description TEXT,
      s3_object_key TEXT NOT NULL UNIQUE,
      file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
      location GEOGRAPHY(POINT, 4326) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'notStarted'
        CHECK (status IN ('notStarted', 'onGoing', 'completed')),
      detection_count INTEGER CHECK (detection_count >= 0),
      highest_severity VARCHAR(50),
      damage_score NUMERIC(10, 4),
      raw_ai_response JSON,
      support_count INTEGER NOT NULL DEFAULT 0 CHECK (support_count >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx
      ON reports (user_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS reports_status_idx
      ON reports (status);

    CREATE INDEX IF NOT EXISTS reports_location_idx
      ON reports USING GIST (location);

    CREATE TABLE IF NOT EXISTS report_supports (
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id, user_id)
    );

    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS support_count INTEGER NOT NULL DEFAULT 0;

    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS description TEXT;

    ALTER TABLE reports
      ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) NOT NULL DEFAULT 'image';

    ALTER TABLE reports
      DROP CONSTRAINT IF EXISTS reports_image_mime_type_check;

    ALTER TABLE reports
      ALTER COLUMN raw_ai_response TYPE JSON
      USING raw_ai_response::json;

    ALTER TABLE reports
      DROP COLUMN IF EXISTS failure_reason,
      DROP COLUMN IF EXISTS ai_model_version,
      DROP COLUMN IF EXISTS processing_status,
      DROP COLUMN IF EXISTS processed_at,
      DROP COLUMN IF EXISTS updated_at,
      DROP COLUMN IF EXISTS location_confirmed;

    CREATE INDEX IF NOT EXISTS report_supports_user_id_idx
      ON report_supports (user_id);

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
};

export default reportSchema;
