import { S3Client } from "@aws-sdk/client-s3";

let s3Client;
let configuredRegion;

export const getS3Client = (config = process.env) => {
  const region = config.AWS_REGION;

  if (!region) {
    throw new Error("Missing required AWS configuration: AWS_REGION");
  }

  if (!s3Client || configuredRegion !== region) {
    const clientOptions = { region };

    if (config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY) {
      clientOptions.credentials = {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        ...(config.AWS_SESSION_TOKEN
          ? { sessionToken: config.AWS_SESSION_TOKEN }
          : {}),
      };
    }

    s3Client = new S3Client(clientOptions);
    configuredRegion = region;
  }

  return s3Client;
};

export default getS3Client;
