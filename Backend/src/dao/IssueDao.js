import { sql } from "../db/postgres.js";

export const createIssue = async ({ reportId, workerId, userId, type, description }) => {
  const text = `
    INSERT INTO admin_issues (
      report_id,
      worker_id,
      user_id,
      type,
      description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      report_id,
      worker_id,
      user_id,
      type,
      description,
      status,
      created_at,
      resolved_at;
  `;
  const [issue] = await sql.unsafe(text, [
    reportId || null,
    workerId || null,
    userId || null,
    type || "WORK_NOT_COMPLETED",
    description || null,
  ]);
  return issue;
};

export const getAllIssues = async (statusFilter = null) => {
  let text = `
    SELECT
      ai.id,
      ai.report_id,
      ai.worker_id,
      ai.user_id,
      ai.type,
      ai.description,
      ai.status,
      ai.created_at,
      ai.resolved_at,
      w.name AS worker_name,
      w.email AS worker_email,
      u.name AS reporter_name,
      u.email AS reporter_email
    FROM admin_issues ai
    LEFT JOIN users w ON ai.worker_id = w.id
    LEFT JOIN users u ON ai.user_id = u.id
  `;

  const values = [];
  if (statusFilter) {
    text += ` WHERE ai.status = $1`;
    values.push(statusFilter);
  }

  text += ` ORDER BY ai.created_at DESC;`;

  return await sql.unsafe(text, values);
};

export const getIssueById = async (issueId) => {
  const text = `
    SELECT
      ai.id,
      ai.report_id,
      ai.worker_id,
      ai.user_id,
      ai.type,
      ai.description,
      ai.status,
      ai.created_at,
      ai.resolved_at,
      w.name AS worker_name,
      w.email AS worker_email,
      u.name AS reporter_name,
      u.email AS reporter_email
    FROM admin_issues ai
    LEFT JOIN users w ON ai.worker_id = w.id
    LEFT JOIN users u ON ai.user_id = u.id
    WHERE ai.id = $1;
  `;
  const [issue] = await sql.unsafe(text, [issueId]);
  return issue;
};

export const updateIssueStatus = async (issueId, status) => {
  const isResolved = status === "RESOLVED";
  const text = `
    UPDATE admin_issues
    SET
      status = $2,
      resolved_at = CASE WHEN $3::boolean THEN CURRENT_TIMESTAMP ELSE NULL END
    WHERE id = $1
    RETURNING
      id,
      report_id,
      worker_id,
      user_id,
      type,
      description,
      status,
      created_at,
      resolved_at;
  `;
  const [issue] = await sql.unsafe(text, [issueId, status, isResolved]);
  return issue;
};
