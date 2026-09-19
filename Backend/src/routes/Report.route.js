import {
  createReport,
  getAllReportsController,
  getReportByIdController,
  getReportsByStatus,
  getReportsByUser,
  requireAdminOrWorkerGroup,
  requireReportOwnerOrAdmin,
  supportExistingReport,
  updateWorkStatus,
} from "../controllers/Report.controller.js";
import {
  placeBid,
  getBidsForReport,
  requireWorker,
} from "../controllers/Bid.controller.js";
import {
  submitVerificationVote,
  getReportVotes,
  requireEndUser,
} from "../controllers/Verification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const reportRoutes = async (fastify) => {
  fastify.post("/create", { preHandler: [authenticate] }, createReport);
  fastify.get(
    "/all",
    getAllReportsController,
  );
  fastify.get(
    "/user/:userId",
    { preHandler: [authenticate, requireReportOwnerOrAdmin] },
    getReportsByUser,
  );
  fastify.get(
    "/status/:status",
    { preHandler: [authenticate, requireAdminOrWorkerGroup] },
    getReportsByStatus,
  );
  fastify.post(
    "/:reportId/support",
    { preHandler: [authenticate] },
    supportExistingReport,
  );

  // Single report details
  fastify.get(
    "/:reportId",
    getReportByIdController,
  );

  // Worker Bidding
  fastify.post(
    "/:reportId/bids",
    { preHandler: [authenticate, requireWorker] },
    placeBid,
  );
  fastify.get(
    "/:reportId/bids",
    { preHandler: [authenticate] },
    getBidsForReport,
  );

  // Worker Lifecycle Status Transition
  fastify.patch(
    "/:reportId/status",
    { preHandler: [authenticate, requireWorker] },
    updateWorkStatus,
  );

  // Community Verification Voting
  fastify.post(
    "/:reportId/vote",
    { preHandler: [authenticate, requireEndUser] },
    submitVerificationVote,
  );
  fastify.get(
    "/:reportId/votes",
    { preHandler: [authenticate] },
    getReportVotes,
  );
};

export default reportRoutes;

