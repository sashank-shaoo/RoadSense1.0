import {
  createBid,
  getBidsForReport as fetchBidsForReport,
} from "../dao/BidDao.js";
import { findWorkerById } from "../dao/UserDao.js";
import { findWorkerGroupById } from "../dao/WorkerDao.js";
import { bidReportIdSchema, placeBidBodySchema } from "../zod/BidSchema.js";

export const requireWorker = async (request, reply) => {
  const role = request.user?.role;

  // Accept both individual WORKERs and WORKER_GROUPs
  if (role !== "WORKER" && role !== "WORKER_GROUP") {
    return reply.status(403).send({
      success: false,
      error: "Worker authentication required",
    });
  }

  // Validate the account is still active (role-specific lookup)
  if (role === "WORKER") {
    const worker = await findWorkerById(request.user.id);
    if (!worker || worker.is_active === false) {
      return reply.status(403).send({
        success: false,
        error: "Worker account is inactive or disabled",
      });
    }
  } else {
    // WORKER_GROUP — lookup in worker_groups table
    const group = await findWorkerGroupById(request.user.id);
    if (!group) {
      return reply.status(403).send({
        success: false,
        error: "Worker group account not found or disabled",
      });
    }
  }
};


export const placeBid = async (request, reply) => {
  try {
    const reportIdResult = bidReportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid report ID format",
        details: reportIdResult.error.format(),
      });
    }

    const bodyResult = placeBidBodySchema.safeParse(request.body || {});
    if (!bodyResult.success) {
      const issueMsg = bodyResult.error.issues?.[0]?.message || "Invalid bid amount";
      return reply.status(400).send({
        success: false,
        error: issueMsg,
        details: bodyResult.error.format(),
      });
    }

    const workerId = request.user.id;
    const bid = await createBid(reportIdResult.data, workerId, bodyResult.data.amount);

    return reply.status(201).send({
      success: true,
      message: "Bid placed successfully",
      data: bid,
    });
  } catch (error) {
    if (error.message === "REPORT_NOT_FOUND") {
      return reply.status(404).send({
        success: false,
        error: "Report not found",
      });
    }
    if (error.message === "REPORT_NOT_BIDDING") {
      return reply.status(409).send({
        success: false,
        error: "Report is not currently open for bidding",
      });
    }
    if (error.message === "BIDDING_WINDOW_CLOSED") {
      return reply.status(409).send({
        success: false,
        error: "12-hour bidding period has closed for this report",
      });
    }
    if (error.message === "BID_NOT_LOWER") {
      return reply.status(400).send({
        success: false,
        error: `Your bid must be lower than the current lowest bid of ₹${error.currentLowest.toLocaleString('en-IN')}`,
        currentLowest: error.currentLowest,
      });
    }
    if (error.message === "ALREADY_LOWEST_BIDDER") {
      return reply.status(409).send({
        success: false,
        error: "You already hold the lowest bid on this report",
      });
    }
    if (error.message === "INVALID_AMOUNT") {
      return reply.status(400).send({
        success: false,
        error: "Bid amount must be a positive number greater than 0",
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error while placing bid",
    });
  }
};

export const getBidsForReport = async (request, reply) => {
  try {
    const reportIdResult = bidReportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid report ID format",
        details: reportIdResult.error.format(),
      });
    }

    const isAuthorized =
      request.user?.role === "ADMIN" ||
      (request.user?.admin && request.user.role === "ADMIN") ||
      request.user?.role === "WORKER" ||
      request.user?.role === "WORKER_GROUP";

    if (!isAuthorized) {
      return reply.status(403).send({
        success: false,
        error: "Access denied: only admins and workers may view bids",
      });
    }

    const bids = await fetchBidsForReport(reportIdResult.data);

    return reply.status(200).send({
      success: true,
      data: bids,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error while retrieving bids",
    });
  }
};
