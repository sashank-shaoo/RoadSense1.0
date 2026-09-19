// Defines the report_verifications table for citizen verification vote pool

export const verificationSchema = {
  tableName: "report_verifications",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    report_id: { type: "UUID", required: true, references: "reports(id)" },
    user_id: { type: "UUID", required: true, references: "users(id)" },
    result: {
      type: "VARCHAR(20)",
      required: true,
      enum: ["COMPLETED", "NOT_COMPLETED"],
    },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
    updated_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS report_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      result VARCHAR(20) NOT NULL CHECK (result IN ('COMPLETED', 'NOT_COMPLETED')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_vote_per_user UNIQUE (report_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS verifications_report_id_idx ON report_verifications (report_id);
    CREATE INDEX IF NOT EXISTS verifications_user_id_idx ON report_verifications (user_id);
  `,
};

export default verificationSchema;
