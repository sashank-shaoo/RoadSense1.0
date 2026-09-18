import { sql } from "../db/postgres.js";

export const createReport = async (reportData) => {
  return await sql.begin(async (transaction) => {
    const text = `
      INSERT INTO reports (
        user_id, media_type, image_mime_type, original_filename, description, s3_object_key, file_size_bytes, location
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($9, $8), 4326)::geography)
      RETURNING
        id,
        user_id,
        media_type,
        image_mime_type,
        original_filename,
        description,
        s3_object_key,
        file_size_bytes,
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
        status,
        detection_count,
        highest_severity,
        damage_score,
        raw_ai_response,
        created_at,
        support_count;
    `;

    const values = [
      reportData.user_id,
      reportData.media_type || (reportData.image_mime_type?.startsWith("video/") ? "video" : "image"),
      reportData.image_mime_type,
      reportData.original_filename,
      reportData.description,
      reportData.s3_object_key,
      reportData.file_size_bytes,
      reportData.location.latitude,
      reportData.location.longitude,
    ];

    const [report] = await transaction.unsafe(text, values);
    const [user] = await transaction.unsafe(
      `UPDATE users
       SET credit_points = credit_points + 50, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING credit_points`,
      [reportData.user_id],
    );

    return { ...report, credit_points: user.credit_points };
  });
};

export const findNearbyReport = async (location, radiusMeters = 20) => {
  const text = `
    SELECT
      id,
      user_id,
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at,
      ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
      ) AS distance_meters
    FROM reports
    WHERE ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
      $3
    )
    ORDER BY distance_meters ASC, created_at ASC
    LIMIT 1;
  `;

  const [report] = await sql.unsafe(text, [
    location.latitude,
    location.longitude,
    radiusMeters,
  ]);
  return report;
};

export const supportReport = async (reportId, userId) => {
  return await sql.begin(async (transaction) => {
    const [reportOwner] = await transaction.unsafe(
      "SELECT id, user_id FROM reports WHERE id = $1",
      [reportId],
    );

    if (!reportOwner) {
      throw new Error("Report not found");
    }

    if (reportOwner.user_id === userId) {
      throw new Error("Users cannot support their own reports");
    }

    const [support] = await transaction.unsafe(
      `INSERT INTO report_supports (report_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (report_id, user_id) DO NOTHING
       RETURNING report_id`,
      [reportId, userId],
    );

    if (!support) {
      return { alreadySupported: true };
    }

    const [report] = await transaction.unsafe(
      `UPDATE reports
       SET support_count = support_count + 1
       WHERE id = $1
       RETURNING id, support_count`,
      [reportId],
    );

    if (!report) {
      throw new Error("Report not found");
    }

    const [user] = await transaction.unsafe(
      `UPDATE users
       SET credit_points = credit_points + 10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING credit_points`,
      [userId],
    );

    if (!user) {
      throw new Error("User not found");
    }

    return {
      alreadySupported: false,
      supportCount: report.support_count,
      creditPoints: user.credit_points,
    };
  });
};

export const findReportById = async (reportId, userId) => {
  const text = `
    SELECT
      id,
      user_id,
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at
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
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at
    FROM reports
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  return await sql.unsafe(text, [userId]);
};

export const getAllReports = async () => {
  const text = `
    SELECT
      id,
      user_id,
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at
    FROM reports
    ORDER BY created_at DESC;
  `;

  return await sql.unsafe(text);
};

export const getReportsByStatus = async (status) => {
  const text = `
    SELECT
      id,
      user_id,
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at
    FROM reports
    WHERE status = $1
    ORDER BY created_at DESC;
  `;

  return await sql.unsafe(text, [status]);
};

export const completeReport = async (reportId, userId, aiResult) => {
  const text = `
    UPDATE reports
    SET
      detection_count = $3,
      highest_severity = $4,
      damage_score = $5,
      raw_ai_response = $6::json
    WHERE id = $1 AND user_id = $2
    RETURNING
      id,
      user_id,
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at;
  `;

  const values = [
    reportId,
    userId,
    aiResult.count,
    aiResult.highest_severity,
    aiResult.damage_score,
    JSON.stringify(aiResult),
  ];

  const [report] = await sql.unsafe(text, values);
  return report;
};

export const updateReportWorkStatus = async (reportId, status) => {
  const text = `
    UPDATE reports
    SET
      status = $2
    WHERE id = $1
    RETURNING
      id,
      user_id,
      media_type,
      image_mime_type,
      original_filename,
      description,
      s3_object_key,
      file_size_bytes,
      ST_Y(location::geometry) AS latitude,
      ST_X(location::geometry) AS longitude,
      json_build_array(ST_X(location::geometry), ST_Y(location::geometry)) AS coordinates,
      status,
      detection_count,
      highest_severity,
      damage_score,
      raw_ai_response,
      support_count,
      created_at;
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
