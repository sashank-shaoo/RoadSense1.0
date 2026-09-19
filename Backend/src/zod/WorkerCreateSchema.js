import * as z from "zod";

export const workerUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email(),
  password: z.string().min(6).max(255),
  phone: z.string().trim().max(50).optional().nullable(),
});

export const workerToggleStatusSchema = z.object({
  is_active: z.boolean(),
});

export const workerUserIdSchema = z.string().uuid();
