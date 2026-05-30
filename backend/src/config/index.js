import dotenv from 'dotenv';
dotenv.config();

const bool = (v, fallback) => (v == null ? fallback : v === 'true');

// MOCK_MODE is forced on if no AWS region is configured, so the app always runs.
const hasAws = Boolean(process.env.AWS_REGION && process.env.S3_BUCKET);

export const config = {
  port: Number(process.env.PORT || 4000),
  env: process.env.NODE_ENV || 'development',
  mockMode: bool(process.env.MOCK_MODE, true) || !hasAws,

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-change-me',
    issuer: process.env.JWT_ISSUER || 'sehat-local',
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.S3_BUCKET,
    bedrockModelId:
      process.env.BEDROCK_MODEL_ID ||
      'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
  },

  databaseUrl: process.env.DATABASE_URL,
};
