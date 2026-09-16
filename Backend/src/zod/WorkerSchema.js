import * as z from "zod";

export const workerGroupCreateSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email(),
  password: z.string().min(6).max(255),
});

export const workerGroupLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(255),
});
