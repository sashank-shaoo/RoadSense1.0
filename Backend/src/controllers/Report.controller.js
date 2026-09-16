import { findUserbyId } from "../dao/UserDao.js";
import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import {
  completeReport,
  createReport as insertReport,
  replaceReportDetections,
  findNearbyReport,
  supportReport,
  getAllReports,
  getReportsByUserId,
  getReportsByStatus as getReportsByStatusDao,
} from "../dao/ReportDao.js";
import {
  createDownloadUrl,
  downloadObject,
  uploadObject,
} from "../AWS/s3Service.js";
import { predictImage } from "../AWS/ec2Service.js";
import {
  aiResponseSchema,
  reportCreateSchema,
  reportIdSchema,
  reportStatusSchema,
} from "../zod/ReportSchema.js";

const getS3ErrorStatus = (error) => {
  if (error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) {
    return 404;
  }

  if (error?.name === "Forbidden" || error?.$metadata?.httpStatusCode === 403) {
    return 403;
  }

  return 502;
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

    let imageUpload;
    const formFields = {};

    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (imageUpload) {
          return reply.status(400).send({
            success: false,
            error: "Only one image file is allowed",
          });
        }

        if (part.fieldname !== "file") {
          return reply.status(400).send({
            success: false,
            error: "Image field must be named 'file'",
          });
        }

        imageUpload = {
          buffer: await part.toBuffer(),
          filename: part.filename,
          mimetype: part.mimetype,
        };
      } else {
        formFields[part.fieldname] = part.value;
      }
    }

    if (!imageUpload) {
      return reply.status(400).send({
        success: false,
        error: "An image file is required",
      });
    }

    const imageBuffer = imageUpload.buffer;
    const latitude = Number(formFields.latitude);
    const longitude = Number(formFields.longitude);
    const safeFilename = basename(imageUpload.filename);
    const reportDataInput = {
      image_mime_type: imageUpload.mimetype,
      original_filename: safeFilename,
      description: formFields.description || null,
      s3_object_key: `reports/${userId}/${randomUUID()}/${safeFilename}`,
      file_size_bytes: imageBuffer.length,
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
      return reply.status(200).send({
        success: true,
        duplicate: true,
        message: "A report already exists within 20 meters",
        report: nearbyReport,
      });
    }

    try {
      await uploadObject({
        objectKey: reportData.s3_object_key,
        body: imageBuffer,
        contentType: reportData.image_mime_type,
        config: request.server.config,
      });
    } catch (error) {
      request.log.error({ error }, "Unable to upload report image to S3");
      return reply.status(getS3ErrorStatus(error)).send({
        success: false,
        error: "Report image could not be uploaded to S3",
      });
    }

    const createdReport = await insertReport({
      ...reportData,
      user_id: userId,
    });

    let processingPhase = "downloading image from S3";
    let aiValidationIssues;

    try {
      const image = await downloadObject({
        objectKey: reportData.s3_object_key,
        config: request.server.config,
      });

      processingPhase = "calling EC2 AI prediction service";
      const aiResponse = await predictImage({
        imageBuffer: image.body,
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
      const imageUrl = await createDownloadUrl({
        objectKey: completedReport.s3_object_key,
        expiresIn: 3600,
        config: request.server.config,
      });

      return reply.status(201).send({
        success: true,
        message: "Report created and processed successfully",
        report: {
          ...completedReport,
          image_url: imageUrl,
        },
      });
    } catch (error) {
      request.log.error(
        { error, reportId: createdReport.id, processingPhase },
        "Report processing failed",
      );
      return reply.status(502).send({
        success: false,
        error: "Report was created, but image processing failed",
        report_id: createdReport.id,
        failed_phase: processingPhase,
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
    return reply.status(200).send({ success: true, reports });
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
    return reply.status(200).send({ success: true, reports });
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
    return reply.status(200).send({ success: true, reports });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Failed to fetch reports by status",
    });
  }
};
