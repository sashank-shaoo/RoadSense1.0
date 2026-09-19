import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Config } from "./awsConfig.js";
import { getS3Client } from "./s3Client.js";

export const createUploadUrl = async ({
  objectKey,
  contentType,
  expiresIn = 900,
  config,
}) => {
  const awsConfig = getS3Config(config);
  const command = new PutObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  return getSignedUrl(getS3Client(config), command, { expiresIn });
};

export const uploadObject = async ({
  objectKey,
  body,
  contentType,
  config,
}) => {
  const awsConfig = getS3Config(config);
  const command = new PutObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  });

  return getS3Client(config).send(command);
};

export const createDownloadUrl = async ({
  objectKey,
  expiresIn = 300,
  config,
}) => {
  const awsConfig = getS3Config(config);
  const command = new GetObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
  });

  return getSignedUrl(getS3Client(config), command, { expiresIn });
};

export const headObject = async ({ objectKey, config }) => {
  const awsConfig = getS3Config(config);
  const command = new HeadObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
  });

  return getS3Client(config).send(command);
};

export const downloadObject = async ({ objectKey, config }) => {
  const awsConfig = getS3Config(config);
  const command = new GetObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
  });

  const response = await getS3Client(config).send(command);
  const bytes = await response.Body.transformToByteArray();

  return {
    body: Buffer.from(bytes),
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
};

export const deleteObject = async ({ objectKey, config }) => {
  const awsConfig = getS3Config(config);
  const command = new DeleteObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
  });

  return getS3Client(config).send(command);
};

