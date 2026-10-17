import { Router } from "express";
import { AuthRoutes } from "../module/Auth/auth.route";
import { FraudDetectionRoutes } from "../module/FraudDetection/fraudDetection.route";
import { LandCaseRoutes } from "../module/LandCase/case.route";
import { DocumentRoutes } from "../module/LandDocument/document.route";
import { LandRecordRoutes } from "../module/LandRecord/record.route";
import { RagRoutes } from "../module/Rag/rag.route";
import { ReportRoutes } from "../module/RiskReport/report.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/cases",
    route: LandCaseRoutes,
  },
  {
    path: "/documents",
    route: DocumentRoutes,
  },
  {
    path: "/records",
    route: LandRecordRoutes,
  },
  {
    path: "/fraud-detection",
    route: FraudDetectionRoutes,
  },
  {
    path: "/rag",
    route: RagRoutes,
  },
  {
    path: "/reports",
    route: ReportRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const rootRouter = router;
