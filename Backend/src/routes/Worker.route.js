import {
  createWorkerGroupController,
  getallWorker_group,
  getWorkerGroupProfile,
  loginWorkerGroup,
  logoutWorkerGroup,
  requireAdmin,
  requireWorkerGroup,
} from "../controllers/Worker.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const workerRoutes = async (fastify) => {
  fastify.post("/login", loginWorkerGroup);
  fastify.post(
    "/groups/create",
    { preHandler: [authenticate, requireAdmin] },
    createWorkerGroupController,
  );
  fastify.get(
    "/groups/all",
    { preHandler: [authenticate, requireAdmin] },
    getallWorker_group,
  );
  fastify.post(
    "/logout",
    { preHandler: [authenticate, requireWorkerGroup] },
    logoutWorkerGroup,
  );
  fastify.get(
    "/profile",
    { preHandler: [authenticate, requireWorkerGroup] },
    getWorkerGroupProfile,
  );
};

export default workerRoutes;
