import { getAiConfig, getS3Config } from "./awsConfig.js";

const createTimeoutSignal = (timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();

  return { controller, timeout };
};

export const predictMedia = async ({
  s3ObjectKey,
  mediaType = "image",
  mediaBuffer,
  filename,
  contentType,
  config,
}) => {
  const awsConfig = getAiConfig(config);
  const s3Config = getS3Config(config);
  const bucketName = s3Config.bucketName;

  const { controller, timeout } = createTimeoutSignal(
    awsConfig.aiServiceTimeoutMs,
  );

  try {
    // 1. Primary: Pass S3 object key and bucket to EC2 AI service so it fetches media from S3
    const jsonPayload = {
      s3_object_key: s3ObjectKey,
      s3_bucket: bucketName,
      bucket: bucketName,
      media_type: mediaType,
      filename: filename || s3ObjectKey.split("/").pop(),
      content_type: contentType,
    };

    let response = await fetch(awsConfig.aiServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(jsonPayload),
      signal: controller.signal,
    });

    // 2. Fallback: If FastAPI endpoint expected multipart/form-data
    if (
      (response.status === 415 || response.status === 422) &&
      (mediaBuffer || s3ObjectKey)
    ) {
      const formData = new FormData();
      formData.append("s3_object_key", s3ObjectKey);
      formData.append("s3_bucket", bucketName);
      formData.append("media_type", mediaType);
      if (Buffer.isBuffer(mediaBuffer) && mediaBuffer.length > 0) {
        formData.append(
          "file",
          new Blob([mediaBuffer], { type: contentType }),
          filename || "media",
        );
      }

      response = await fetch(awsConfig.aiServiceUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    }

    const responseText = await response.text();
    let responseBody;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      throw new Error(
        `AI service returned a non-JSON response: ${responseText.slice(0, 200)}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `AI service failed with HTTP ${response.status}: ${JSON.stringify(responseBody)}`,
      );
    }

    return responseBody;
  } finally {
    clearTimeout(timeout);
  }
};

export const predictImage = predictMedia;
export default predictMedia;
