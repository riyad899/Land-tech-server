import app from "./app";
import { envVars } from "./app/config/env";
import { prisma } from "./app/lib/prisma";
import { redisService } from "./app/lib/redis";

async function main() {
  try {
    // 1. Connect Redis
    console.log("Connecting to Redis...");
    await redisService.connect();

    // 2. Test DB Connection
    console.log("Connecting to Neon PostgreSQL...");
    await prisma.$connect();
    console.log("Connected to Neon PostgreSQL successfully.");

    // 3. Start Express Server (finding open port starting from envVars.PORT)
    const startListening = async (startPort: number): Promise<{ server: any; port: number }> => {
      let currentPort = startPort;
      while (currentPort < startPort + 20) {
        const result: any = await new Promise((resolve) => {
          const s = app.listen(currentPort, () => {
            resolve({ server: s, port: currentPort });
          });

          s.on("error", (err: any) => {
            if (err.code === "EADDRINUSE") {
              console.warn(`⚠️ Port ${currentPort} is occupied. Trying port ${currentPort + 1}...`);
              resolve(null);
            } else {
              console.error(`Error binding port ${currentPort}:`, err);
              resolve(null);
            }
          });
        });

        if (result && result.server) {
          return result;
        }
        currentPort++;
      }
      throw new Error("No free ports available in range.");
    };

    const { server, port } = await startListening(envVars.PORT);

    // Save active port for Next.js proxy
    try {
      const fs = require("fs");
      const path = require("path");
      fs.writeFileSync(path.join(process.cwd(), ".port.json"), JSON.stringify({ port }));
    } catch (e) {}

    console.log(`====================================================`);
    console.log(`🛡️  ভূমিপ্রহরী (BhumiProhori) Server is Live on Port ${port}`);
    console.log(`🌍 Frontend URL: ${envVars.FRONTEND_URL}`);
    console.log(`📡 API Endpoints: http://localhost:${port}/api`);
    console.log(`====================================================`);

    const exitHandler = () => {
      if (server) {
        server.close(async () => {
          console.log("Server closed.");
          await redisService.disconnect();
          await prisma.$disconnect();
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      console.error("Unexpected error:", error);
      exitHandler();
    };

    process.on("uncaughtException", unexpectedErrorHandler);
    process.on("unhandledRejection", unexpectedErrorHandler);

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully...");
      if (server) {
        server.close();
      }
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
