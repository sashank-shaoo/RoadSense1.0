import argon2 from "argon2";
import {
  createAdmin,
  findAdminByEmail,
  findAdminById,
} from "../dao/AdminDao.js";
import {
  getAllUsers,
  findUserByEmail,
  createWorker,
  getWorkers,
  toggleWorkerActive,
} from "../dao/UserDao.js";
import { getAllWorkerGroups } from "../dao/WorkerDao.js";
import {
  getAllIssues,
  updateIssueStatus,
} from "../dao/IssueDao.js";
import { adminCreateSchema, adminLoginSchema } from "../zod/AdminSchema.js";
import {
  workerUserCreateSchema,
  workerToggleStatusSchema,
  workerUserIdSchema,
} from "../zod/WorkerCreateSchema.js";
import {
  issueIdSchema,
  issueStatusUpdateSchema,
} from "../zod/IssueSchema.js";

const adminCookieOptions = (request) => ({
  path: "/",
  httpOnly: true,
  secure: request.server.config.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const requireAdmin = async (request, reply) => {
  if (!request.user?.admin || request.user.role !== "ADMIN") {
    return reply.status(403).send({
      success: false,
      error: "Administrator authentication required",
    });
  }
};

export const createAdminController = async (request, reply) => {
  try {
    const validationResult = adminCreateSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const { name, email, password } = validationResult.data;

    if (await findAdminByEmail(email)) {
      return reply.status(409).send({
        success: false,
        error: "Admin email already exists",
      });
    }

    const admin = await createAdmin({
      name,
      email,
      passwordHash: await argon2.hash(password),
    });

    return reply.status(201).send({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to create admin",
    });
  }
};

export const loginAdmin = async (request, reply) => {
  try {
    const validationResult = adminLoginSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const admin = await findAdminByEmail(validationResult.data.email);
    if (
      !admin ||
      !(await argon2.verify(
        admin.password_hash,
        validationResult.data.password,
      ))
    ) {
      return reply.status(401).send({
        success: false,
        error: "Invalid admin email or password",
      });
    }

    const token = request.server.jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        admin: true,
      },
      { expiresIn: "7d" },
    );

    reply.setCookie("admin_token", token, adminCookieOptions(request));
    return reply.status(200).send({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Admin login failed",
    });
  }
};

export const logoutAdmin = async (request, reply) => {
  reply.clearCookie("admin_token", { path: "/" });
  return reply.status(200).send({
    success: true,
    message: "Admin logout successful",
  });
};

export const getAdminProfile = async (request, reply) => {
  try {
    const admin = await findAdminById(request.user.id);
    if (!admin) {
      return reply
        .status(404)
        .send({ success: false, error: "Admin not found" });
    }
    return reply.status(200).send({ success: true, admin });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ success: false, error: "Failed to fetch admin profile" });
  }
};

export const getAllUsersForAdmin = async (request, reply) => {
  try {
    return reply
      .status(200)
      .send({ success: true, users: await getAllUsers() });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ success: false, error: "Failed to fetch users" });
  }
};

export const getAllWorkerGroupsForAdmin = async (request, reply) => {
  try {
    return reply.status(200).send({
      success: true,
      worker_groups: await getAllWorkerGroups(),
    });
  } catch (error) {
    request.log.error(error);
    return reply
      .status(500)
      .send({ success: false, error: "Failed to fetch worker groups" });
  }
};

export const createWorkerController = async (request, reply) => {
  try {
    const validationResult = workerUserCreateSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: validationResult.error.format(),
      });
    }

    const { name, email, password, phone } = validationResult.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: "User with this email already exists",
      });
    }

    const passwordHash = await argon2.hash(password);
    const worker = await createWorker({
      name,
      email,
      passwordHash,
      phone: phone || null,
    });

    return reply.status(201).send({
      success: true,
      message: "Worker account created successfully",
      worker,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to create worker account",
    });
  }
};

export const getWorkersController = async (request, reply) => {
  try {
    const workers = await getWorkers();
    return reply.status(200).send({
      success: true,
      workers,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch workers",
    });
  }
};

export const updateWorkerStatusController = async (request, reply) => {
  try {
    const idResult = workerUserIdSchema.safeParse(request.params.workerId);
    if (!idResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid worker ID format",
      });
    }

    const bodyResult = workerToggleStatusSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid status payload. 'is_active' (boolean) is required.",
      });
    }

    const updated = await toggleWorkerActive(idResult.data, bodyResult.data.is_active);
    if (!updated) {
      return reply.status(404).send({
        success: false,
        error: "Worker not found",
      });
    }

    return reply.status(200).send({
      success: true,
      message: `Worker account ${bodyResult.data.is_active ? "activated" : "deactivated"} successfully`,
      worker: updated,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to update worker status",
    });
  }
};

export const getAdminIssuesController = async (request, reply) => {
  try {
    const statusFilter = request.query?.status || null;
    const issues = await getAllIssues(statusFilter);
    return reply.status(200).send({
      success: true,
      issues,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch issues",
    });
  }
};

export const resolveAdminIssueController = async (request, reply) => {
  try {
    const idResult = issueIdSchema.safeParse(request.params.issueId);
    if (!idResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid issue ID format",
      });
    }

    const bodyResult = issueStatusUpdateSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid status. Must be 'OPEN', 'UNDER_REVIEW', or 'RESOLVED'",
      });
    }

    const updated = await updateIssueStatus(idResult.data, bodyResult.data.status);
    if (!updated) {
      return reply.status(404).send({
        success: false,
        error: "Issue not found",
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Issue status updated successfully",
      issue: updated,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to update issue status",
    });
  }
};


