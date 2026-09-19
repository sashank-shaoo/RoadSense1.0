import { sql } from "../db/postgres.js";
import {
  findExpiredBiddingReports,
} from "../dao/ReportDao.js";
import {
  getEarliestActiveBid,
  finalizeReportBids,
} from "../dao/BidDao.js";

/**
 * Periodically processes reports whose 24-hour bidding period has expired.
 * Assigns the winning worker using the "first-bid-wins" rule.
 */
export const finalizeExpiredBids = async (logger = console) => {
  try {
    const expiredReports = await findExpiredBiddingReports();
    if (!expiredReports || expiredReports.length === 0) {
      return;
    }

    logger.info?.(`[BiddingJob] Found ${expiredReports.length} expired bidding report(s) to finalize`);

    for (const item of expiredReports) {
      try {
        await sql.begin(async (tx) => {
          // Lock row to prevent concurrency races
          const [report] = await tx.unsafe(
            `SELECT id, status, bidding_ends_at
             FROM reports
             WHERE id = $1 AND status = 'BIDDING'
             FOR UPDATE SKIP LOCKED;`,
            [item.id],
          );

          if (!report) {
            return;
          }

          // Fetch earliest active bid (first-bid-wins)
          const winningBid = await getEarliestActiveBid(report.id);

          if (winningBid) {
            await finalizeReportBids(tx, report.id, winningBid.id);
            await tx.unsafe(
              `UPDATE reports
               SET assigned_worker_id = $2,
                   status = 'ASSIGNED'
               WHERE id = $1;`,
              [report.id, winningBid.worker_id],
            );
            logger.info?.(`[BiddingJob] Assigned worker ${winningBid.worker_id} to report ${report.id}`);
          } else {
            // No bids were received: reset timer so future bids can trigger a new window
            await tx.unsafe(
              `UPDATE reports
               SET bidding_started_at = NULL,
                   bidding_ends_at = NULL
               WHERE id = $1;`,
              [report.id],
            );
            logger.info?.(`[BiddingJob] No bids found for report ${report.id}. Reset timer.`);
          }
        });
      } catch (err) {
        logger.error?.(`[BiddingJob] Error processing report ${item.id}: ${err.message}`, err);
      }
    }
  } catch (error) {
    logger.error?.(`[BiddingJob] Error in finalizeExpiredBids: ${error.message}`, error);
  }
};
