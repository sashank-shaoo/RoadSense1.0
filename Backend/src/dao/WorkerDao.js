import { sql } from "../db/postgres.js";

export const createWorkerGroup = async ({ name, email, passwordHash }) => {
  const text = `
    INSERT INTO worker_groups (name, email, password_hash, role)
    VALUES ($1, $2, $3, 'WORKER_GROUP')
    RETURNING id, name, email, role;
  `;

  const [workerGroup] = await sql.unsafe(text, [name, email, passwordHash]);
  return workerGroup;
};
export const findWorkerGroupByEmail = async (email) => {
  const [workerGroup] = await sql.unsafe(
    `SELECT id, name, email, password_hash, role
     FROM worker_groups
     WHERE email = $1;`,
    [email],
  );
  return workerGroup;
};

export const findWorkerGroupById = async (id) => {
  const [workerGroup] = await sql.unsafe(
    `SELECT id, name, email, role
     FROM worker_groups
     WHERE id = $1;`,
    [id],
  );
  return workerGroup;
};

export const getAllWorkerGroups = async () => {
  return await sql.unsafe(`
    SELECT id, name, email, role
    FROM worker_groups
    ORDER BY name ASC;
  `);
};

export const updateWorkerGroupCredentials = async (
  workerGroupId,
  email,
  passwordHash,
) => {
  const [workerGroup] = await sql.unsafe(
    `UPDATE worker_groups
     SET email = $2, password_hash = $3
     WHERE id = $1
    RETURNING id, name, email, role;`,
    [workerGroupId, email, passwordHash],
  );
  return workerGroup;
};

export const getGroupMembers = async (workerGroupId) => {
  return await sql.unsafe(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, wgm.joined_at
     FROM worker_group_members wgm
     JOIN users u ON u.id = wgm.worker_id
     WHERE wgm.worker_group_id = $1
     ORDER BY wgm.joined_at ASC;`,
    [workerGroupId],
  );
};

export const addMemberToGroup = async (workerGroupId, workerId) => {
  const [member] = await sql.unsafe(
    `INSERT INTO worker_group_members (worker_group_id, worker_id)
     VALUES ($1, $2)
     ON CONFLICT (worker_group_id, worker_id) DO NOTHING
     RETURNING worker_group_id, worker_id, joined_at;`,
    [workerGroupId, workerId],
  );
  return member;
};

export const removeMemberFromGroup = async (workerGroupId, workerId) => {
  await sql.unsafe(
    `DELETE FROM worker_group_members
     WHERE worker_group_id = $1 AND worker_id = $2;`,
    [workerGroupId, workerId],
  );
  return { success: true };
};

