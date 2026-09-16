import { sql } from "../db/postgres.js";

export const createWorkerGroup = async ({ name, email, passwordHash }) => {
  const text = `
    INSERT INTO worker_groups (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email;
  `;

  const [workerGroup] = await sql.unsafe(text, [name, email, passwordHash]);
  return workerGroup;
};

export const findWorkerGroupByEmail = async (email) => {
  const [workerGroup] = await sql.unsafe(
    `SELECT id, name, email, password_hash
     FROM worker_groups
     WHERE email = $1;`,
    [email],
  );
  return workerGroup;
};

export const findWorkerGroupById = async (id) => {
  const [workerGroup] = await sql.unsafe(
    `SELECT id, name, email
     FROM worker_groups
     WHERE id = $1;`,
    [id],
  );
  return workerGroup;
};

export const getAllWorkerGroups = async () => {
  return await sql.unsafe(`
    SELECT id, name, email
    FROM worker_groups
    ORDER BY name ASC;
  `);
};
