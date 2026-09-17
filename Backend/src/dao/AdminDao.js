import { sql } from "../db/postgres.js";
import argon2 from "argon2";

export const createAdmin = async ({ name, email, passwordHash }) => {
  const [admin] = await sql.unsafe(
    `INSERT INTO admins (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'ADMIN')
     RETURNING id, name, email, role, created_at;`,
    [name, email, passwordHash],
  );
  return admin;
};

export const findAdminByEmail = async (email) => {
  const [admin] = await sql.unsafe(
    `SELECT id, name, email, password_hash, role, created_at
     FROM admins
     WHERE email = $1;`,
    [email],
  );
  return admin;
};

export const findAdminById = async (id) => {
  const [admin] = await sql.unsafe(
    `SELECT id, name, email, role, created_at
     FROM admins
     WHERE id = $1;`,
    [id],
  );
  return admin;
};

export const ensureBootstrapAdmin = async ({ name, email, password }) => {
  const passwordHash = await argon2.hash(password);
  const [admin] = await sql.unsafe(
    `INSERT INTO admins (name, email, password_hash, role)
    SELECT $1, $2, $3, 'ADMIN'
     WHERE NOT EXISTS (SELECT 1 FROM admins)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, name, email, role;`,
    [name, email, passwordHash],
  );
  return admin;
};
