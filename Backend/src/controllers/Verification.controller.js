import {
  createVote,
  findUserVote,
  getVotesForReport as fetchVotesForReport,
} from "../dao/VerificationDao.js";
import { getReportById } from "../dao/ReportDao.js";
import {
  verificationVoteSchema,
  verificationReportIdSchema,
} from "../zod/VerificationSchema.js";

export const requireEndUser = async (request, reply) => {
  if (request.user?.role !== "END_USER") {
    return reply.status(403).send({
      success: false,
      error: "Only end users may participate in verification voting",
    });
  }
};

export const submitVerificationVote = async (request, reply) => {
  try {
    const reportIdResult = verificationReportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid report ID format",
        details: reportIdResult.error.format(),
      });
    }

    const bodyResult = verificationVoteSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid vote payload",
        details: bodyResult.error.format(),
      });
    }

    const reportId = reportIdResult.data;
    const userId = request.user.id;
    const { result } = bodyResult.data;

    const report = await getReportById(reportId);
    if (!report) {
      return reply.status(404).send({
        success: false,
        error: "Report not found",
      });
    }

    if (report.status !== "VERIFICATION" && report.status !== "completed") {
      return reply.status(409).send({
        success: false,
        error: "Report is not currently in the verification stage",
      });
    }

    if (report.verification_ends_at && new Date(report.verification_ends_at) <= new Date()) {
      return reply.status(409).send({
        success: false,
        error: "Verification voting window has closed for this report",
      });
    }

    const existingVote = await findUserVote(reportId, userId);
    if (existingVote) {
      return reply.status(409).send({
        success: false,
        error: "You have already cast your vote on this report",
      });
    }

    const vote = await createVote(reportId, userId, result);

    return reply.status(201).send({
      success: true,
      message: "Verification vote submitted successfully",
      data: vote,
    });
  } catch (error) {
    if (error.code === "23505") { // unique constraint violation
      return reply.status(409).send({
        success: false,
        error: "You have already cast your vote on this report",
      });
    }
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error while submitting verification vote",
    });
  }
};

export const getReportVotes = async (request, reply) => {
  try {
    const reportIdResult = verificationReportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid report ID format",
        details: reportIdResult.error.format(),
      });
    }

    const reportId = reportIdResult.data;
    const votesData = await fetchVotesForReport(reportId);

    let userVote = null;
    if (request.user?.id) {
      const existing = await findUserVote(reportId, request.user.id);
      if (existing) {
        userVote = existing.result;
      }
    }

    return reply.status(200).send({
      success: true,
      data: {
        ...votesData,
        userVote,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error while retrieving verification votes",
    });
  }
};
