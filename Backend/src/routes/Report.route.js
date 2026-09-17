import {
  createReport,
  getAllReportsController,
  getReportsByStatus,
  getReportsByUser,
  requireAdminOrWorkerGroup,
  requireReportOwnerOrAdmin,
  supportExistingReport,
} from "../controllers/Report.controller.js";
import { requireAdmin } from "../controllers/Admin.controller.js";
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
};

export default reportRoutes;
