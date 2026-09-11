import { createReport } from "../controllers/Report.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const reportRoutes = async (fastify) => {
  fastify.post("/", { preHandler: [authenticate] }, createReport);
};

export default reportRoutes;
