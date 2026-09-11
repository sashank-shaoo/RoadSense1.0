import { findUserbyId } from "../dao/UserDao.js";
import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import {
  completeReport,
  createReport as insertReport,
  failReport,
  markReportProcessing,
  replaceReportDetections,
} from "../dao/ReportDao.js";
import { downloadObject, uploadObject } from "../AWS/s3Service.js";
import { predictImage } from "../AWS/ec2Service.js";
import { aiResponseSchema, reportCreateSchema } from "../zod/ReportSchema.js";

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

    let processingPhase = "marking processing started";
    let aiValidationIssues;

    try {
      await markReportProcessing(createdReport.id, userId);

      processingPhase = "downloading image from S3";
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

      processingPhase = "saving completed report";
      const completedReport = await completeReport(
        createdReport.id,
        userId,
        validatedAiResponse.data,
      );

      return reply.status(201).send({
        success: true,
        message: "Report created and processed successfully",
        report: completedReport,
      });
    } catch (error) {
      request.log.error(
        { error, reportId: createdReport.id, processingPhase },
        "Report processing failed",
      );
      await failReport(
        createdReport.id,
        userId,
        "Image processing failed. Please try again.",
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
