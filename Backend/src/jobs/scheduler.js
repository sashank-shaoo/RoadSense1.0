import { finalizeExpiredBids } from "./biddingJob.js";
import { cleanupExpiredCompletedReports } from "./cleanupJob.js";

let biddingTimer = null;
let cleanupTimer = null;

const BIDDING_INTERVAL_MS = 60 * 1000; // Check expired bidding every 1 minute
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // Check expired verifications every 15 minutes

export const startScheduler = (config, logger = console) => {
  logger.info?.("[Scheduler] Initializing RoadSense background lifecycle jobs...");

  // Run initial checks after 5 seconds to let server finish boot
  setTimeout(async () => {
    try {
      await finalizeExpiredBids(logger);
      await cleanupExpiredCompletedReports(config, logger);
    } catch (err) {
      logger.error?.(`[Scheduler] Error in initial run: ${err.message}`, err);
    }
  }, 5000);

  // Periodic bidding finalization
  biddingTimer = setInterval(async () => {
    try {
      await finalizeExpiredBids(logger);
    } catch (err) {
      logger.error?.(`[Scheduler] Error in bidding interval: ${err.message}`, err);
    }
  }, BIDDING_INTERVAL_MS);

  // Periodic verification cleanup
  cleanupTimer = setInterval(async () => {
    try {
      await cleanupExpiredCompletedReports(config, logger);
    } catch (err) {
      logger.error?.(`[Scheduler] Error in cleanup interval: ${err.message}`, err);
    }
  }, CLEANUP_INTERVAL_MS);

  logger.info?.("[Scheduler] Background jobs scheduled successfully.");
};

export const stopScheduler = (logger = console) => {
  if (biddingTimer) {
    clearInterval(biddingTimer);
    biddingTimer = null;
  }
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  logger.info?.("[Scheduler] Background jobs stopped.");
};
