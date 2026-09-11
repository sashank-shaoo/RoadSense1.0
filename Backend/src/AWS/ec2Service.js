import { getAiConfig } from "./awsConfig.js";

const createTimeoutSignal = (timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();

  return { controller, timeout };
};

export const predictImage = async ({
  imageBuffer,
  filename,
  contentType,
  config,
}) => {
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new TypeError("imageBuffer must be a non-empty Buffer");
  }

  const awsConfig = getAiConfig(config);
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([imageBuffer], { type: contentType }),
    filename,
  );

  const { controller, timeout } = createTimeoutSignal(
    awsConfig.aiServiceTimeoutMs,
  );

  try {
    const response = await fetch(awsConfig.aiServiceUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    const responseText = await response.text();
    let responseBody;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      throw new Error("AI service returned a non-JSON response");
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
