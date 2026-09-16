import {
  createReport,
  supportExistingReport,
} from "../controllers/Report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const reportRoutes = async (fastify) => {
  fastify.post("/", { preHandler: [authenticate] }, createReport);
  fastify.post(
    "/:reportId/support",
    { preHandler: [authenticate] },
    supportExistingReport,
  );
};

export default reportRoutes;
