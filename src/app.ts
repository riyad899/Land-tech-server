import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { envVars } from "./app/config/env";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { rootRouter } from "./app/routes";

const app: Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or any localhost origin
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Root health check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "ভূমিপ্রহরী (BhumiProhori) AI Backend Server is Running Smoothly! 🇧🇩",
    version: "1.0.0",
    docs: "/api/rag/stats",
  });
});

// Mount routes at both /api and /api/v1 for seamless compatibility
app.use("/api", rootRouter);
app.use("/api/v1", rootRouter);

// Global Error Handler & 404
app.use(globalErrorHandler);
app.use(notFound);

export default app;
