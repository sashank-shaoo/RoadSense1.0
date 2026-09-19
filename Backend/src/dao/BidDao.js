import { sql } from "../db/postgres.js";

/**
 * Place a bid.  If this is the FIRST bid on the report, also sets
 * bidding_started_at and bidding_ends_at (NOW + 24 h) on the report row.
 * Wrapped in a transaction so the bid + timer update are atomic.
 */
export const createBid = async (reportId, workerId, amount) => {
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

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    // Get the current lowest active bid on this report
    const [lowestActiveBid] = await tx.unsafe(
      `SELECT id, worker_id, amount
       FROM bids
       WHERE report_id = $1 AND status = 'ACTIVE' AND amount IS NOT NULL
       ORDER BY amount ASC, created_at ASC
       LIMIT 1;`,
      [reportId],
    );

    if (lowestActiveBid) {
      const currentLowest = Number(lowestActiveBid.amount);
      if (numericAmount >= currentLowest) {
        const err = new Error("BID_NOT_LOWER");
        err.currentLowest = currentLowest;
        throw err;
      }
      if (lowestActiveBid.worker_id === workerId) {
        throw new Error("ALREADY_LOWEST_BIDDER");
      }
    }

    // Insert or update bid — if worker already bid, update their bid to the new lower amount
    const [bid] = await tx.unsafe(
      `INSERT INTO bids (report_id, worker_id, amount, status)
       VALUES ($1, $2, $3, 'ACTIVE')
       ON CONFLICT (report_id, worker_id)
       DO UPDATE SET amount = EXCLUDED.amount, status = 'ACTIVE', updated_at = NOW()
       RETURNING id, report_id, worker_id, amount, status, created_at, updated_at;`,
      [reportId, workerId, numericAmount],
    );

    // If this is the first bid, start the 12-hour bidding window and ensure status is BIDDING
    if (!report.bidding_started_at) {
      await tx.unsafe(
        `UPDATE reports
         SET bidding_started_at = NOW(),
             bidding_ends_at    = NOW() + INTERVAL '12 hours',
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
    `SELECT b.id, b.report_id, b.worker_id, b.amount, b.status, b.created_at, b.updated_at,
            COALESCE(u.name, wg.name) AS worker_name,
            COALESCE(u.email, wg.email) AS worker_email
     FROM bids b
     LEFT JOIN users u ON u.id = b.worker_id
     LEFT JOIN worker_groups wg ON wg.id = b.worker_id
     WHERE b.report_id = $1
     ORDER BY b.amount ASC NULLS LAST, b.created_at ASC;`,
    [reportId],
  );
};

/**
 * Find the single lowest ACTIVE bid (lowest-bid-wins rule).
 * Used by the bidding finalization job.
 */
export const getLowestActiveBid = async (reportId) => {
  const [bid] = await sql.unsafe(
    `SELECT id, worker_id, amount FROM bids
     WHERE report_id = $1 AND status = 'ACTIVE'
     ORDER BY amount ASC NULLS LAST, created_at ASC
     LIMIT 1;`,
    [reportId],
  );
  return bid;
};

// Backwards compatibility alias
export const getEarliestActiveBid = getLowestActiveBid;

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
