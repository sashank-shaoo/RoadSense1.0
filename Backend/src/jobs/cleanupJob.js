import { sql } from "../db/postgres.js";
import {
  findExpiredVerificationReports,
  softDeleteReport,
} from "../dao/ReportDao.js";
import { getVotesForReport } from "../dao/VerificationDao.js";
import { createIssue } from "../dao/IssueDao.js";
import { deleteObject } from "../AWS/s3Service.js";

/**
 * Periodically processes reports whose 7-day verification window has ended.
 * Evaluates the community vote pool:
 * - If NOT_COMPLETED >= COMPLETED (or contested): escalates to admin issue, sets status = 'ESCALATED'
 * - If COMPLETED > NOT_COMPLETED (or 0 objections): deletes S3 image and sets status = 'DELETED'
 */
export const cleanupExpiredCompletedReports = async (config, logger = console) => {
  try {
    const expiredReports = await findExpiredVerificationReports();
    if (!expiredReports || expiredReports.length === 0) {
      return;
    }

    logger.info?.(`[CleanupJob] Found ${expiredReports.length} expired verification report(s) to process`);

    for (const report of expiredReports) {
      try {
        const { summary } = await getVotesForReport(report.id);
        const completedCount = summary?.completed_count || 0;
        const notCompletedCount = summary?.not_completed_count || 0;

        // If not completed votes are equal to or outnumber completed votes (and at least 1 negative vote)
        const isRejected = notCompletedCount > 0 && notCompletedCount >= completedCount;

        if (isRejected) {
          logger.warn?.(
            `[CleanupJob] Report ${report.id} verification rejected: ${notCompletedCount} NOT_COMPLETED vs ${completedCount} COMPLETED. Escalating to admin issue.`
          );

          await sql.begin(async (tx) => {
            // Update report status to ESCALATED
            await tx.unsafe(
              `UPDATE reports SET status = 'ESCALATED' WHERE id = $1;`,
              [report.id],
            );

            // Log admin issue
            await tx.unsafe(
              `INSERT INTO admin_issues (
                report_id, worker_id, user_id, type, description, status
               ) VALUES ($1, $2, $3, 'WORK_NOT_COMPLETED', $4, 'OPEN');`,
              [
                report.id,
                report.assigned_worker_id || null,
                report.user_id || null,
                `Community verification failed: ${notCompletedCount} voted NOT_COMPLETED vs ${completedCount} COMPLETED.`,
              ],
            );
          });
        } else {
          logger.info?.(
            `[CleanupJob] Report ${report.id} verification passed (${completedCount} COMPLETED vs ${notCompletedCount} NOT_COMPLETED). Cleaning up and soft-deleting.`
          );

          // Clean up media file from S3 if configured
          if (report.s3_object_key) {
            try {
              await deleteObject({
                objectKey: report.s3_object_key,
                config,
              });
              logger.info?.(`[CleanupJob] Deleted S3 object: ${report.s3_object_key}`);
            } catch (s3Err) {
              logger.warn?.(`[CleanupJob] Could not delete S3 object ${report.s3_object_key}: ${s3Err.message}`);
            }
          }

          // Soft delete the report
          await softDeleteReport(report.id);
        }
      } catch (err) {
        logger.error?.(`[CleanupJob] Error processing report ${report.id}: ${err.message}`, err);
      }
    }
  } catch (error) {
    logger.error?.(`[CleanupJob] Error in cleanupExpiredCompletedReports: ${error.message}`, error);
  }
};
