import {
  createAdminController,
  getAdminProfile,
  getAllUsersForAdmin,
  getAllWorkerGroupsForAdmin,
  loginAdmin,
  logoutAdmin,
  requireAdmin,
  createWorkerController,
  getWorkersController,
  updateWorkerStatusController,
  getAdminIssuesController,
  resolveAdminIssueController,
} from "../controllers/Admin.controller.js";
import { createWorkerGroupController } from "../controllers/Worker.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { strictAuthRateLimitConfig } from "../services/rateLimitService.js";

const adminRoutes = async (fastify) => {
  fastify.post("/login", strictAuthRateLimitConfig, loginAdmin);
  if (fastify.config.ADMIN_CREATION_ENABLED === "true") {
    // Temporary bootstrap route. Disable it after creating the admin.
    fastify.post("/create", strictAuthRateLimitConfig, createAdminController);
  }
  fastify.post(
    "/create-worker-group",
    { preHandler: [authenticate, requireAdmin] },
    createWorkerGroupController,
  );
  fastify.post(
    "/logout",
    { preHandler: [authenticate, requireAdmin] },
    logoutAdmin,
  );
  fastify.get(
    "/profile",
    { preHandler: [authenticate, requireAdmin] },
    getAdminProfile,
  );
  fastify.get(
    "/users",
    { preHandler: [authenticate, requireAdmin] },
    getAllUsersForAdmin,
  );
  fastify.get(
    "/worker-groups",
    { preHandler: [authenticate, requireAdmin] },
    getAllWorkerGroupsForAdmin,
  );

  // Worker management
  fastify.post(
    "/workers",
    { preHandler: [authenticate, requireAdmin] },
    createWorkerController,
  );
  fastify.get(
    "/workers",
    { preHandler: [authenticate, requireAdmin] },
    getWorkersController,
  );
  fastify.patch(
    "/workers/:workerId",
    { preHandler: [authenticate, requireAdmin] },
    updateWorkerStatusController,
  );

  // Issue management
  fastify.get(
    "/issues",
    { preHandler: [authenticate, requireAdmin] },
    getAdminIssuesController,
  );
  fastify.patch(
    "/issues/:issueId",
    { preHandler: [authenticate, requireAdmin] },
    resolveAdminIssueController,
  );
};

export default adminRoutes;

