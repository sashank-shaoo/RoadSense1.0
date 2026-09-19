import { sql } from "../db/postgres.js";

/**
 * Place a bid.  If this is the FIRST bid on the report, also sets
 * bidding_started_at and bidding_ends_at (NOW + 24 h) on the report row.
 * Wrapped in a transaction so the bid + timer update are atomic.
 */
export const createBid = async (reportId, workerId) => {
  return await sql.begin(async (tx) => {
    // Lock the report row to prevent concurrent first-bid races
    const [report] = await tx.unsafe(
      `SELECT id, status, bidding_started_at, bidding_ends_at FROM reports WHERE id = $1 FOR UPDATE;`,
      [reportId],
    );

    if (!report) throw new Error("REPORT_NOT_FOUND");
    if (report.status !== "BIDDING" && report.status !== "notStarted") {
      throw new Error("REPORT_NOT_BIDDING");
    }

    if (report.bidding_ends_at && new Date(report.bidding_ends_at) <= new Date()) {
      throw new Error("BIDDING_WINDOW_CLOSED");
    }

    // Insert bid — UNIQUE constraint will reject duplicate bids from same worker
    const [bid] = await tx.unsafe(
      `INSERT INTO bids (report_id, worker_id, status)
       VALUES ($1, $2, 'ACTIVE')
       ON CONFLICT (report_id, worker_id) DO NOTHING
       RETURNING id, report_id, worker_id, status, created_at;`,
      [reportId, workerId],
    );

    if (!bid) throw new Error("DUPLICATE_BID");

    // If this is the first bid, start the 24-hour bidding window and ensure status is BIDDING
    if (!report.bidding_started_at) {
      await tx.unsafe(
        `UPDATE reports
         SET bidding_started_at = NOW(),
             bidding_ends_at    = NOW() + INTERVAL '24 hours',
             status             = 'BIDDING'
         WHERE id = $1;`,
        [reportId],
      );
    }

    return bid;
  });
};

/**
 * Get all bids for a report.
 */
export const getBidsForReport = async (reportId) => {
  return await sql.unsafe(
    `SELECT b.id, b.report_id, b.worker_id, b.status, b.created_at, b.updated_at,
            COALESCE(u.name, wg.name) AS worker_name,
            COALESCE(u.email, wg.email) AS worker_email
     FROM bids b
     LEFT JOIN users u ON u.id = b.worker_id
     LEFT JOIN worker_groups wg ON wg.id = b.worker_id
     WHERE b.report_id = $1
     ORDER BY b.created_at ASC;`,
    [reportId],
  );
};

/**
 * Find the single earliest ACTIVE bid (first-bid-wins rule).
 * Used by the bidding finalization job.
 */
export const getEarliestActiveBid = async (reportId) => {
  const [bid] = await sql.unsafe(
    `SELECT id, worker_id FROM bids
     WHERE report_id = $1 AND status = 'ACTIVE'
     ORDER BY created_at ASC
     LIMIT 1;`,
    [reportId],
  );
  return bid;
};

/**
 * Mark the winning bid ACCEPTED and all other bids REJECTED.
 * Called inside the assignment transaction.
 */
export const finalizeReportBids = async (tx, reportId, winnerBidId) => {
  await tx.unsafe(
    `UPDATE bids
     SET status = 'ACCEPTED', updated_at = NOW()
     WHERE id = $1;`,
    [winnerBidId],
  );
  await tx.unsafe(
    `UPDATE bids
     SET status = 'REJECTED', updated_at = NOW()
     WHERE report_id = $1 AND id <> $2;`,
    [reportId, winnerBidId],
  );
};
