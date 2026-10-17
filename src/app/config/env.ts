import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const envVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL || "",
  REDIS_URL: process.env.REDIS_URL || "",
  
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "bhumiprohori_jwt_access_secret_super_secure_key_2026",
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "bhumiprohori_jwt_refresh_secret_super_secure_key_2026",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  EMAIL: {
    SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER || "",
    SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS || "",
    SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT ? parseInt(process.env.EMAIL_SENDER_SMTP_PORT, 10) : 465,
    SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM || "",
  },

  GOOGLE: {
    CLIENT_ID: process.env.Google_Client_ID || "",
    CLIENT_SECRET: process.env.Google_Client_Secret || "",
    CALLBACK_URL: process.env.Google_callbackURL || "http://localhost:8000/api/auth/google/callback",
  },

  RAG: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
    OPENROUTER_EMBEDDING_MODEL: process.env.OPENROUTER_EMBEDDING_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2:free",
    OPENROUTER_LLM_MODEL: process.env.OPENROUTER_LLM_MODEL || "nvidia/nemotron-3-super-120b-a12b:free",
  },

  IMGBB: {
    API_KEY: process.env.IMGBB_API_KEY || "d732e2d3628828094e6747fe5c2e457b",
  },
};
