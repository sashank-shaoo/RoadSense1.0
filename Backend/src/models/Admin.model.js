// Defines dedicated administrator accounts for the admin panel

export const adminSchema = {
  tableName: "admins",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    name: { type: "VARCHAR(255)", required: true },
    email: { type: "VARCHAR(255)", required: true, unique: true },
    password_hash: { type: "VARCHAR(255)", required: true },
    role: {
      type: "VARCHAR(50)",
      default: "ADMIN",
      enum: ["ADMIN"],
    },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'ADMIN'
        CHECK (role = 'ADMIN'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    UPDATE admins SET role = 'ADMIN' WHERE role <> 'ADMIN';
    ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'admins_role_admin_only'
          AND conrelid = 'admins'::regclass
      ) THEN
        ALTER TABLE admins
          ADD CONSTRAINT admins_role_admin_only CHECK (role = 'ADMIN');
      END IF;
    END;
    $$;
  `,
};

export default adminSchema;
