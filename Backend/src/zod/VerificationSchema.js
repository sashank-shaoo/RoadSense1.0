import * as z from "zod";

export const verificationVoteSchema = z.object({
  result: z.enum(["COMPLETED", "NOT_COMPLETED"]),
});

export const verificationReportIdSchema = z.string().uuid();
