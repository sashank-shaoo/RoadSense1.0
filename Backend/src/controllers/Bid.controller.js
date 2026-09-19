import {
  createBid,
  getBidsForReport as fetchBidsForReport,
} from "../dao/BidDao.js";
import { findWorkerById } from "../dao/UserDao.js";
import { bidReportIdSchema } from "../zod/BidSchema.js";

export const requireWorker = async (request, reply) => {
  if (request.user?.role !== "WORKER") {
    return reply.status(403).send({
      success: false,
      error: "Worker authentication required",
    });
  }

  const worker = await findWorkerById(request.user.id);
  if (!worker || worker.is_active === false) {
    return reply.status(403).send({
      success: false,
      error: "Worker account is inactive or disabled",
    });
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

    const workerId = request.user.id;
    const bid = await createBid(reportIdResult.data, workerId);

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
        error: "Bidding period has closed for this report",
      });
    }
    if (error.message === "DUPLICATE_BID") {
      return reply.status(409).send({
        success: false,
        error: "You have already placed a bid on this report",
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
      request.user?.role === "WORKER";

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
