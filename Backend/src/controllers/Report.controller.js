import { findUserbyId } from "../dao/UserDao.js";
import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import {
  completeReport,
  createReport as insertReport,
  replaceReportDetections,
  findNearbyReport,
  findReportStatusById,
  getReportById,
  updateReportLifecycle,
  supportReport,
  getAllReports,
  getReportsByUserId,
  getReportsByStatus as getReportsByStatusDao,
} from "../dao/ReportDao.js";
import {
  createDownloadUrl,
  uploadObject,
} from "../AWS/s3Service.js";
import { predictMedia } from "../AWS/ec2Service.js";
import {
  aiResponseSchema,
  reportCreateSchema,
  reportIdSchema,
  reportStatusSchema,
  workerStatusUpdateSchema,
} from "../zod/ReportSchema.js";

export const requireAdminOrWorkerGroup = async (request, reply) => {
  if (
    !(request.user?.admin && request.user.role === "ADMIN") &&
    request.user?.role !== "WORKER_GROUP"
  ) {
    return reply.status(403).send({
      success: false,
      error: "Administrator or worker group authentication required",
    });
  }
};

export const requireReportOwnerOrAdmin = async (request, reply) => {
  const isAdmin = request.user?.admin && request.user.role === "ADMIN";
  if (!isAdmin && request.user?.id !== request.params.userId) {
    return reply.status(403).send({
      success: false,
      error: "You can only view your own reports",
    });
  }
};

const getS3ErrorStatus = (error) => {
  if (error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) {
    return 404;
  }

  if (error?.name === "Forbidden" || error?.$metadata?.httpStatusCode === 403) {
    return 403;
  }

  return 502;
};

const attachMediaUrls = async (reports, config) => {
  return Promise.all(
    reports.map(async (report) => {
      let mediaUrl = null;
      if (report.s3_object_key) {
        try {
          mediaUrl = await createDownloadUrl({
            objectKey: report.s3_object_key,
            expiresIn: 3600,
            config,
          });
        } catch {
          // If signing fails, keep null
        }
      }
      return {
        ...report,
        media_url: mediaUrl,
        image_url: mediaUrl,
        video_url: report.media_type === "video" ? mediaUrl : null,
      };
    }),
  );
};

export const createReport = async (request, reply) => {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized access",
      });
    }

    const user = await findUserbyId(userId);
    if (!user) {
      return reply.status(404).send({
        success: false,
        error: "User not found",
      });
    }

    if (!user.is_varified_email) {
      return reply.status(403).send({
        success: false,
        error: "Only verified users can create reports",
      });
    }

    if (!request.isMultipart()) {
      return reply.status(400).send({
        success: false,
        error: "Request must use multipart/form-data",
      });
    }

    let mediaUpload;
    const formFields = {};

    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (mediaUpload) {
          return reply.status(400).send({
            success: false,
            error: "Only one media file (image or video) is allowed per report",
          });
        }

        if (part.fieldname !== "file") {
          return reply.status(400).send({
            success: false,
            error: "Media file field must be named 'file'",
          });
        }

        mediaUpload = {
          buffer: await part.toBuffer(),
          filename: part.filename,
          mimetype: part.mimetype,
        };
      } else {
        formFields[part.fieldname] = part.value;
      }
    }

    if (!mediaUpload) {
      return reply.status(400).send({
        success: false,
        error: "A media file (image or video) is required",
      });
    }

    const isVideo = mediaUpload.mimetype.startsWith("video/");
    const isImage = mediaUpload.mimetype.startsWith("image/");
    if (!isVideo && !isImage) {
      return reply.status(400).send({
        success: false,
        error: "Uploaded file must be a valid image or video",
      });
    }

    const mediaType = isVideo ? "video" : "image";
    const mediaBuffer = mediaUpload.buffer;
    const latitude = Number(formFields.latitude);
    const longitude = Number(formFields.longitude);
    const safeFilename = basename(mediaUpload.filename);

    // Stored in separate S3 paths: reports/images/... or reports/videos/...
    const folder = mediaType === "video" ? "reports/videos" : "reports/images";
    const s3ObjectKey = `${folder}/${userId}/${randomUUID()}/${safeFilename}`;

    const reportDataInput = {
      media_type: mediaType,
      image_mime_type: mediaUpload.mimetype,
      original_filename: safeFilename,
      description: formFields.description || null,
      s3_object_key: s3ObjectKey,
      file_size_bytes: mediaBuffer.length,
      location: { latitude, longitude },
    };

    const validationResult = reportCreateSchema.safeParse(reportDataInput);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: validationResult.error.issues,
      });
    }

    const reportData = validationResult.data;
    const nearbyReport = await findNearbyReport(reportData.location, 20);
    if (nearbyReport) {
      let nearbyMediaUrl = null;
      if (nearbyReport.s3_object_key) {
        try {
          nearbyMediaUrl = await createDownloadUrl({
            objectKey: nearbyReport.s3_object_key,
            expiresIn: 3600,
            config: request.server.config,
          });
        } catch {
          // ignore error
        }
      }

      return reply.status(200).send({
        success: true,
        duplicate: true,
        message: "A report already exists within 20 meters",
        report: {
          ...nearbyReport,
          s3_object_key: nearbyReport.s3_object_key,
          media_url: nearbyMediaUrl,
          image_url: nearbyMediaUrl,
          video_url: nearbyReport.media_type === "video" ? nearbyMediaUrl : null,
        },
      });
    }

    try {
      await uploadObject({
        objectKey: reportData.s3_object_key,
        body: mediaBuffer,
        contentType: reportData.image_mime_type,
        config: request.server.config,
      });
    } catch (error) {
      request.log.error({ error }, "Unable to upload report media to S3");
      return reply.status(getS3ErrorStatus(error)).send({
        success: false,
        error: "Report media could not be uploaded to S3",
      });
    }

    const createdReport = await insertReport({
      ...reportData,
      user_id: userId,
    });

    let processingPhase = "calling EC2 AI prediction service with S3 object key";
    let aiValidationIssues;

    try {
      // Pass S3 object key, bucket, and media details to EC2 AI service
      const aiResponse = await predictMedia({
        s3ObjectKey: reportData.s3_object_key,
        mediaType: reportData.media_type,
        mediaBuffer,
        filename: reportData.original_filename,
        contentType: reportData.image_mime_type,
        config: request.server.config,
      });

      processingPhase = "validating EC2 AI response";
      const validatedAiResponse = aiResponseSchema.safeParse(aiResponse);
      if (!validatedAiResponse.success) {
        aiValidationIssues = validatedAiResponse.error.issues;
        request.log.error(
          {
            reportId: createdReport.id,
            aiResponse,
            issues: aiValidationIssues,
          },
          "EC2 AI response failed validation",
        );
        throw new Error("AI service returned an invalid response");
      }

      processingPhase = "saving AI detections";
      await replaceReportDetections(
        createdReport.id,
        validatedAiResponse.data.detections,
      );

      processingPhase = "saving AI report results";
      const completedReport = await completeReport(
        createdReport.id,
        userId,
        validatedAiResponse.data,
      );

      const mediaUrl = await createDownloadUrl({
        objectKey: completedReport.s3_object_key,
        expiresIn: 3600,
        config: request.server.config,
      });

      return reply.status(201).send({
        success: true,
        message: "Report created and processed successfully",
        report: {
          ...completedReport,
          s3_object_key: completedReport.s3_object_key,
          media_type: completedReport.media_type || reportData.media_type,
          media_url: mediaUrl,
          image_url: mediaUrl,
          video_url: (completedReport.media_type || reportData.media_type) === "video" ? mediaUrl : null,
        },
      });
    } catch (error) {
      request.log.error(
        {
          reportId: createdReport.id,
          processingPhase,
          errorName: error?.name,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorCause: error?.cause?.message,
        },
        "Report AI processing failed",
      );

      // Even if AI prediction encounters an issue, return the saved report and media URL
      let fallbackMediaUrl = null;
      try {
        fallbackMediaUrl = await createDownloadUrl({
          objectKey: createdReport.s3_object_key,
          expiresIn: 3600,
          config: request.server.config,
        });
      } catch {
        // ignore
      }

      return reply.status(202).send({
        success: true,
        warning: "Report was saved and uploaded to S3, but AI processing failed or timed out",
        report_id: createdReport.id,
        failed_phase: processingPhase,
        report: {
          ...createdReport,
          s3_object_key: createdReport.s3_object_key,
          media_type: reportData.media_type,
          media_url: fallbackMediaUrl,
          image_url: fallbackMediaUrl,
          video_url: reportData.media_type === "video" ? fallbackMediaUrl : null,
        },
        ...(aiValidationIssues
          ? { validation_issues: aiValidationIssues }
          : {}),
      });
    }
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to create report",
    });
  }
};

// Final / closed statuses where support/voting is no longer allowed
const CLOSED_STATUSES = new Set([
  "completed",
  "VERIFICATION",
  "ESCALATED",
  "DELETED",
]);

export const supportExistingReport = async (request, reply) => {
  try {
    const userId = request.user?.id;
    const reportIdResult = reportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "reportId must be a valid UUID",
      });
    }

    // Block support on closed/completed reports
    const reportStatus = await findReportStatusById(reportIdResult.data);
    if (!reportStatus) {
      return reply.status(404).send({
        success: false,
        error: "Report not found",
      });
    }
    if (CLOSED_STATUSES.has(reportStatus.status)) {
      return reply.status(409).send({
        success: false,
        error: "This report has been completed and no longer accepts support votes",
      });
    }

    const result = await supportReport(reportIdResult.data, userId);

    if (result.alreadySupported) {
      return reply.status(200).send({
        success: true,
        message: "Report already supported",
        already_supported: true,
      });
    }

    return reply.status(201).send({
      success: true,
      message: "Report supported successfully",
      support_count: result.supportCount,
      credit_points: result.creditPoints,
    });
  } catch (error) {
    request.log.error(error);
    const statusCode =
      error.message === "Report not found"
        ? 404
        : error.message === "Users cannot support their own reports"
          ? 403
          : error.message === "User not found"
            ? 401
            : 500;

    return reply.status(statusCode).send({
      success: false,
      error:
        error.message === "Report not found"
          ? "Report not found"
          : error.message === "Users cannot support their own reports"
            ? "You cannot support your own report"
            : error.message === "User not found"
              ? "Authenticated user not found"
              : "Failed to support report",
    });
  }
};

export const getAllReportsController = async (request, reply) => {
  try {
    const reports = await getAllReports();
    const reportsWithUrls = await attachMediaUrls(reports, request.server.config);
    return reply.status(200).send({ success: true, reports: reportsWithUrls });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch reports",
    });
  }
};

export const getReportsByUser = async (request, reply) => {
  try {
    const userIdResult = reportIdSchema.safeParse(request.params.userId);
    if (!userIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "userId must be a valid UUID",
      });
    }

    const reports = await getReportsByUserId(userIdResult.data);
    const reportsWithUrls = await attachMediaUrls(reports, request.server.config);
    return reply.status(200).send({ success: true, reports: reportsWithUrls });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch user reports",
    });
  }
};

export const getReportsByStatus = async (request, reply) => {
  try {
    const statusResult = reportStatusSchema.safeParse(request.params.status);
    if (!statusResult.success) {
      return reply.status(400).send({
        success: false,
        error: "status must be notStarted, onGoing, or completed",
      });
    }

    const reports = await getReportsByStatusDao(statusResult.data);
    const reportsWithUrls = await attachMediaUrls(reports, request.server.config);
    return reply.status(200).send({ success: true, reports: reportsWithUrls });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch reports by status",
    });
  }
};

export const updateWorkStatus = async (request, reply) => {
  try {
    const reportIdResult = reportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid report ID format",
        details: reportIdResult.error.format(),
      });
    }

    const bodyResult = workerStatusUpdateSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid status update payload. Status must be 'IN_PROGRESS' or 'COMPLETED'",
        details: bodyResult.error.format(),
      });
    }

    const reportId = reportIdResult.data;
    const { status: targetStatus } = bodyResult.data;
    const workerId = request.user.id;

    const report = await getReportById(reportId);
    if (!report) {
      return reply.status(404).send({
        success: false,
        error: "Report not found",
      });
    }

    // Verify assigned worker
    if (report.assigned_worker_id !== workerId) {
      return reply.status(403).send({
        success: false,
        error: "You are not the assigned worker for this report",
      });
    }

    // Transition validation
    if (targetStatus === "IN_PROGRESS") {
      if (report.status !== "ASSIGNED" && report.status !== "notStarted") {
        return reply.status(409).send({
          success: false,
          error: `Cannot transition report from '${report.status}' to 'IN_PROGRESS'. Report must be in 'ASSIGNED' status.`,
        });
      }

      const updated = await updateReportLifecycle(reportId, {
        status: "IN_PROGRESS",
      });

      return reply.status(200).send({
        success: true,
        message: "Report status updated to IN_PROGRESS",
        data: updated,
      });
    }

    if (targetStatus === "COMPLETED") {
      if (report.status !== "IN_PROGRESS" && report.status !== "onGoing") {
        return reply.status(409).send({
          success: false,
          error: `Cannot mark report as completed from '${report.status}'. Report must be in 'IN_PROGRESS' status.`,
        });
      }

      // Mark completed -> enters 7-day community verification vote pool
      const now = new Date();
      const verificationEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const updated = await updateReportLifecycle(reportId, {
        status: "VERIFICATION",
        completed_at: now.toISOString(),
        verification_ends_at: verificationEndsAt.toISOString(),
      });

      return reply.status(200).send({
        success: true,
        message: "Work marked as completed. Report is now under 7-day community verification.",
        data: updated,
      });
    }

    return reply.status(400).send({
      success: false,
      error: "Invalid target status",
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error while updating work status",
    });
  }
};

export const getReportByIdController = async (request, reply) => {
  try {
    const reportIdResult = reportIdSchema.safeParse(request.params.reportId);
    if (!reportIdResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid report ID format",
      });
    }

    const report = await getReportById(reportIdResult.data);
    if (!report) {
      return reply.status(404).send({
        success: false,
        error: "Report not found",
      });
    }

    const [reportWithUrls] = await attachMediaUrls([report], request.server.config);
    return reply.status(200).send({
      success: true,
      report: reportWithUrls,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error while retrieving report",
    });
  }
};

