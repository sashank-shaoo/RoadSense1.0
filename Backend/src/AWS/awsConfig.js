const readRequired = (config, name) => {
  const value = config?.[name] ?? process.env[name];

  if (!value) {
    throw new Error(`Missing required AWS configuration: ${name}`);
  }

  return value;
};

export const getS3Config = (config = process.env) => ({
  region: readRequired(config, "AWS_REGION"),
  bucketName: readRequired(config, "AWS_S3_BUCKET_NAME"),
});

export const getAiConfig = (config = process.env) => ({
  aiServiceUrl: readRequired(config, "AI_SERVICE_URL"),
  aiServiceTimeoutMs: Number(config.AI_SERVICE_TIMEOUT_MS || 30_000),
});

export const getAwsConfig = (config = process.env) => ({
  ...getS3Config(config),
  ...getAiConfig(config),
});

export default getAwsConfig;
