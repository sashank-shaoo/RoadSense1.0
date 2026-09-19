import { sql } from "../db/postgres.js";

export const createVote = async (reportId, userId, result) => {
  const text = `
    INSERT INTO report_verifications (report_id, user_id, result)
    VALUES ($1, $2, $3)
    RETURNING id, report_id, user_id, result, created_at;
  `;
  const [vote] = await sql.unsafe(text, [reportId, userId, result]);
  return vote;
};

export const findUserVote = async (reportId, userId) => {
  const text = `
    SELECT id, report_id, user_id, result, created_at
    FROM report_verifications
    WHERE report_id = $1 AND user_id = $2;
  `;
  const [vote] = await sql.unsafe(text, [reportId, userId]);
  return vote;
};

export const getVotesForReport = async (reportId) => {
  const summaryText = `
    SELECT
      COUNT(*) FILTER (WHERE result = 'COMPLETED')::int AS completed_count,
      COUNT(*) FILTER (WHERE result = 'NOT_COMPLETED')::int AS not_completed_count,
      COUNT(*)::int AS total_votes
    FROM report_verifications
    WHERE report_id = $1;
  `;
  const [summary] = await sql.unsafe(summaryText, [reportId]);

  const listText = `
    SELECT
      rv.id,
      rv.report_id,
      rv.user_id,
      rv.result,
      rv.created_at,
      u.name AS user_name
    FROM report_verifications rv
    LEFT JOIN users u ON rv.user_id = u.id
    WHERE rv.report_id = $1
    ORDER BY rv.created_at DESC;
  `;
  const votes = await sql.unsafe(listText, [reportId]);

  return {
    summary: summary || { completed_count: 0, not_completed_count: 0, total_votes: 0 },
    votes,
  };
};
