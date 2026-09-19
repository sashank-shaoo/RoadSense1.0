import {
  getWorkerGroupProfile,
  loginWorkerGroup,
  logoutWorkerGroup,
  requireAdmin,
  requireWorkerGroup,
  addMemberController,
  removeMemberController,
  getAvailableWorkersController,
} from "../controllers/Worker.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { strictAuthRateLimitConfig } from "../services/rateLimitService.js";

const workerRoutes = async (fastify) => {
  fastify.post("/login", strictAuthRateLimitConfig, loginWorkerGroup);
  
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
  fastify.get(
    "/available-workers",
    { preHandler: [authenticate, requireWorkerGroup] },
    getAvailableWorkersController,
  );
  fastify.post(
    "/members",
    { preHandler: [authenticate, requireWorkerGroup] },
    addMemberController,
  );
  fastify.delete(
    "/members/:workerId",
    { preHandler: [authenticate, requireWorkerGroup] },
    removeMemberController,
  );
};

export default workerRoutes;
