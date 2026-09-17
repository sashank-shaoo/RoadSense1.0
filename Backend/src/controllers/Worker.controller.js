import argon2 from "argon2";
import {
  createWorkerGroup,
  findWorkerGroupByEmail,
  findWorkerGroupById,
  getAllWorkerGroups,
  updateWorkerGroupCredentials,
} from "../dao/WorkerDao.js";
import {
  workerGroupCreateSchema,
  workerGroupCredentialsSchema,
  workerGroupIdSchema,
  workerGroupLoginSchema,
} from "../zod/WorkerSchema.js";

const workerCookieOptions = (request) => ({
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
      error: "Only administrators can create worker groups",
    });
  }
};
export const requireWorkerGroup = async (request, reply) => {
  if (request.user?.role !== "WORKER_GROUP") {
    return reply.status(403).send({
      success: false,
      error: "Worker group authentication required",
    });
  }
};


export const createWorkerGroupController = async (request, reply) => {
  try {
    const validationResult = workerGroupCreateSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const { name, email, password } = validationResult.data;
    const existingGroup = await findWorkerGroupByEmail(email);
    if (existingGroup) {
      return reply.status(409).send({
        success: false,
        error: "Worker group email already exists",
      });
    }

    const passwordHash = await argon2.hash(password);
    const workerGroup = await createWorkerGroup({
      name,
      email,
      passwordHash,
    });

    return reply.status(201).send({
      success: true,
      message: "Worker group created successfully",
      worker_group: workerGroup,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to create worker group",
    });
  }
};

export const loginWorkerGroup = async (request, reply) => {
  try {
    const validationResult = workerGroupLoginSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const workerGroup = await findWorkerGroupByEmail(
      validationResult.data.email,
    );
    if (
      !workerGroup?.password_hash ||
      !(await argon2.verify(
        workerGroup.password_hash,
        validationResult.data.password,
      ))
    ) {
      return reply.status(401).send({
        success: false,
        error: "Invalid worker group email or password",
      });
    }

    const token = request.server.jwt.sign(
      {
        id: workerGroup.id,
        email: workerGroup.email,
        role: workerGroup.role,
        name: workerGroup.name,
      },
      { expiresIn: "7d" },
    );

    reply.setCookie("worker_token", token, workerCookieOptions(request));
    return reply.status(200).send({
      success: true,
      message: "Worker group login successful",
      worker_group: {
        id: workerGroup.id,
        name: workerGroup.name,
        email: workerGroup.email,
        role: workerGroup.role,
      },
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Worker group login failed",
    });
  }
};

export const logoutWorkerGroup = async (request, reply) => {
  reply.clearCookie("worker_token", { path: "/" });
  return reply.status(200).send({
    success: true,
    message: "Worker group logout successful",
  });
};

export const getWorkerGroupProfile = async (request, reply) => {
  try {
    const workerGroup = await findWorkerGroupById(request.user.id);
    if (!workerGroup) {
      return reply.status(404).send({
        success: false,
        error: "Worker group not found",
      });
    }

    return reply.status(200).send({
      success: true,
      worker_group: workerGroup,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch worker group profile",
    });
  }
};
export const getallWorker_group = async (request, reply) => {
  try {
    const workerGroups = await getAllWorkerGroups();
    return reply.status(200).send({
      success: true,
      worker_groups: workerGroups,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch worker groups",
    });
  }
};

export const resetWorkerGroupCredentials = async (request, reply) => {
  try {
    const groupIdResult = workerGroupIdSchema.safeParse(
      request.params.workerGroupId,
    );
    const credentialsResult = workerGroupCredentialsSchema.safeParse(
      request.body,
    );
    if (!groupIdResult.success || !credentialsResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Valid worker group UUID, email, and password are required",
      });
    }

    const existingGroup = await findWorkerGroupByEmail(
      credentialsResult.data.email,
    );
    if (existingGroup && existingGroup.id !== groupIdResult.data) {
      return reply.status(409).send({
        success: false,
        error: "Worker group email already exists",
      });
    }

    const workerGroup = await updateWorkerGroupCredentials(
      groupIdResult.data,
      credentialsResult.data.email,
      await argon2.hash(credentialsResult.data.password),
    );
    if (!workerGroup) {
      return reply.status(404).send({
        success: false,
        error: "Worker group not found",
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Worker group credentials updated successfully",
      worker_group: workerGroup,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to update worker group credentials",
    });
  }
};
