import { sql } from "../db/postgres.js";

export const createUser = async (userData) => {
  const text = `
    INSERT INTO users (name, email, phone, date_of_birth, occupation, bio, password_hash, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, email, phone, date_of_birth, occupation, bio, role, created_at, updated_at;
  `;
  const values = [
    userData.name,
    userData.email,
    userData.phone || null,
    userData.date_of_birth || null,
    userData.occupation || null,
    userData.bio || null,
    userData.password_hash,
    userData.role || "END_USER",
  ];

  // Use sql.unsafe for $1, $2 parameterized queries in postgres.js
  const [user] = await sql.unsafe(text, values);
  return user;
};

export const findUserByEmail = async (email) => {
  const text = `
    SELECT * FROM users WHERE email = $1;
  `;
  const [user] = await sql.unsafe(text, [email]);
  return user;
};  

export const findUserbyId = async (id) => {
  const text = `
    SELECT * FROM users WHERE id = $1;
  `;
  const [user] = await sql.unsafe(text, [id]);
  return user;
};  

export const updateUser = async (id, userData) => {
  const text = `
    UPDATE users SET
      name = COALESCE($1, name),
      phone = COALESCE($2, phone),
      date_of_birth = COALESCE($3, date_of_birth),
      occupation = COALESCE($4, occupation),
      bio = COALESCE($5, bio),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, name, email, phone, date_of_birth, occupation, bio, role, created_at, updated_at;
  `;
  const values = [
    userData.name || null,
    userData.phone || null,
    userData.date_of_birth || null,
    userData.occupation || null,
    userData.bio || null,
    id,
  ];
  const [user] = await sql.unsafe(text, values);
  return user;
};

export const deleteUser = async (id) => {
  const text = `
    DELETE FROM users WHERE id = $1
    RETURNING id;
  `;
  const [deleted] = await sql.unsafe(text, [id]);
  return deleted;
};

export const getAllUsers = async () => {
  const text = `
    SELECT id, name, email, phone, date_of_birth, occupation, bio, role, is_varified_email, created_at, updated_at
    FROM users
    ORDER BY created_at DESC;
  `;
  return await sql.unsafe(text);
};

export const saveVerificationToken = async (email, token, expiresAt) => {
  const text = `
    UPDATE users SET
      varification_token = $1,
      varification_token_expires_at = $2
    WHERE email = $3
    RETURNING id, email;
  `;
  const [user] = await sql.unsafe(text, [token, expiresAt, email]);
  return user;
};

export const verifyUserEmail = async (email) => {
  const text = `
    UPDATE users SET
      is_varified_email = TRUE,
      varification_token = NULL,
      varification_token_expires_at = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE email = $1
    RETURNING id, name, email, role, is_varified_email, created_at, updated_at;
  `;
  const [user] = await sql.unsafe(text, [email]);
  return user;
};
