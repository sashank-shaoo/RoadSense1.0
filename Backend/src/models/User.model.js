// Defines the schema and table structure for the users table in AWS PostgreSQL

export const userSchema = {
  tableName: "users",
  fields: {
    id: { type: "UUID", primaryKey: true, default: "gen_random_uuid()" },
    name: { type: "VARCHAR(255)", required: true },
    email: { type: "VARCHAR(255)", required: true, unique: true },
    phone: { type: "VARCHAR(50)", default: null },
    date_of_birth: { type: "DATE", default: null },
    occupation: { type: "VARCHAR(100)", default: null },
    bio: { type: "TEXT", default: null },
    password_hash: { type: "VARCHAR(255)", required: true },
    role: {
      type: "VARCHAR(50)",
      default: "END_USER",
      enum: ["END_USER", "WORKER", "ADMIN", "SUPER_ADMIN"],
    },
    credit_points: { type: "INTEGER", required: true, default: 0 },
    is_varified_email: { type: "BOOLEAN", default: false },
    varification_token: { type: "VARCHAR(255)", default: null },
    varification_token_expires_at: { type: "TIMESTAMPTZ", default: null },
    created_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
    updated_at: { type: "TIMESTAMPTZ", default: "CURRENT_TIMESTAMP" },
  },

  // SQL DDL query to initialize the table in PostgreSQL
  createTableQuery: `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      date_of_birth DATE,
      occupation VARCHAR(100),
      bio TEXT,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'END_USER',
      credit_points INTEGER NOT NULL DEFAULT 0 CHECK (credit_points >= 0),
      is_varified_email BOOLEAN DEFAULT false,
      varification_token VARCHAR(255) DEFAULT NULL,
      varification_token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS credit_points INTEGER NOT NULL DEFAULT 0;
  `,
  //     deleteTableQuery: `
  //   DROP TABLE IF EXISTS users;
  // `,
};

export default userSchema;
