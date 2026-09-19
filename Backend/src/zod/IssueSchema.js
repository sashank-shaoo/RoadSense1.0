import * as z from "zod";

export const issueIdSchema = z.string().uuid();

export const issueStatusUpdateSchema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED"]),
});
