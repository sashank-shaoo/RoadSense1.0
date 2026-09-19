import * as z from "zod";

export const bidReportIdSchema = z.string().uuid();
export const bidIdSchema = z.string().uuid();
