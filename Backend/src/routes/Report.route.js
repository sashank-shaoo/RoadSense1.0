import {
  createReport,
  getAllReportsController,
  getReportsByStatus,
  getReportsByUser,
  supportExistingReport,
} from "../controllers/Report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const reportRoutes = async (fastify) => {
  fastify.post("/create", { preHandler: [authenticate] }, createReport);
  fastify.get("/all", { preHandler: [authenticate] }, getAllReportsController);
  fastify.get(
    "/user/:userId",
    { preHandler: [authenticate] },
    getReportsByUser,
  );
  fastify.get(
    "/status/:status",
    { preHandler: [authenticate] },
    getReportsByStatus,
  );
  fastify.post(
    "/:reportId/support",
    { preHandler: [authenticate] },
    supportExistingReport,
  );
};

export default reportRoutes;
