import { Router } from "express";
import { FraudDetectionController } from "./fraudDetection.controller";

const router = Router();

router.post("/analyze/:landCaseId", FraudDetectionController.analyzeCase);

export const FraudDetectionRoutes = router;
