import { sql } from "../db/postgres.js";

export const createReport = async (reportData) => {
  const text = `
    INSERT INTO reports (
      user_id, image_mime_type, original_filename, s3_object_key, file_size_bytes, location
    )
    VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography)
    RETURNING
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at;
  `;

  const values = [
    reportData.user_id,
    reportData.image_mime_type,
    reportData.original_filename,
    reportData.s3_object_key,
    reportData.file_size_bytes,
    reportData.location.latitude,
    reportData.location.longitude,
  ];

  const [report] = await sql.unsafe(text, values);
  return report;
};

export const findReportById = async (reportId, userId) => {
  const text = `
    SELECT
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at
    FROM reports
    WHERE id = $1 AND user_id = $2;
  `;

  const [report] = await sql.unsafe(text, [reportId, userId]);
  return report;
};

export const getReportsByUserId = async (userId) => {
  const text = `
    SELECT
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at
    FROM reports
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  return await sql.unsafe(text, [userId]);
};

export const confirmReportLocation = async (reportId, userId, location) => {
  const text = `
    UPDATE reports
    SET
      location = ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
      location_confirmed = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at;
  `;

  const [report] = await sql.unsafe(text, [
    reportId,
    userId,
    location.longitude,
    location.latitude,
  ]);
  return report;
};

export const markReportProcessing = async (reportId, userId) => {
  const text = `
    UPDATE reports
    SET
      processing_status = 'PROCESSING',
      failure_reason = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND user_id = $2
      AND location_confirmed = true
      AND processing_status IN ('PENDING', 'FAILED')
    RETURNING
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at;
  `;

  const [report] = await sql.unsafe(text, [reportId, userId]);
  return report;
};

export const completeReport = async (reportId, userId, aiResult) => {
  const text = `
    UPDATE reports
    SET
      processing_status = 'COMPLETED',
      failure_reason = NULL,
      detection_count = $3,
      highest_severity = $4,
      damage_score = $5,
      raw_ai_response = $6::jsonb,
      ai_model_version = $7,
      updated_at = CURRENT_TIMESTAMP,
      processed_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at;
  `;

  const values = [
    reportId,
    userId,
    aiResult.count,
    aiResult.highest_severity,
    aiResult.damage_score,
    JSON.stringify(aiResult),
    aiResult.model_version || null,
  ];

  const [report] = await sql.unsafe(text, values);
  return report;
};

export const failReport = async (reportId, userId, failureReason) => {
  const text = `
    UPDATE reports
    SET
      processing_status = 'FAILED',
      failure_reason = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at;
  `;

  const [report] = await sql.unsafe(text, [reportId, userId, failureReason]);
  return report;
};

export const updateReportWorkStatus = async (reportId, status) => {
  const text = `
    UPDATE reports
    SET
      status = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
      user_id,
      image_mime_type,
      original_filename,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      location_confirmed,
      status,
      processing_status,
      failure_reason,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      ai_model_version,
      created_at,
      updated_at,
      processed_at;
  `;

  const [report] = await sql.unsafe(text, [reportId, status]);
  return report;
};

export const replaceReportDetections = async (reportId, detections) => {
  await sql.begin(async (transaction) => {
    await transaction.unsafe(
      "DELETE FROM report_detections WHERE report_id = $1",
      [reportId],
    );

    for (const detection of detections) {
      await transaction.unsafe(
        `
          INSERT INTO report_detections (
            report_id,
            damage_class,
            confidence,
            bbox
          )
          VALUES ($1, $2, $3, $4::jsonb);
        `,
        [
          reportId,
          detection.class,
          detection.confidence,
          JSON.stringify(detection.bbox),
        ],
      );
    }
  });
};

export const getReportDetections = async (reportId) => {
  const text = `
    SELECT id, report_id, damage_class, confidence, bbox, created_at
    FROM report_detections
    WHERE report_id = $1
    ORDER BY created_at ASC;
  `;

  return await sql.unsafe(text, [reportId]);
};
