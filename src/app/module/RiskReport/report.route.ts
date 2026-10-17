import { Router } from "express";
import { ReportController } from "./report.controller";

const router = Router();

router.get("/:landCaseId", ReportController.getCaseReport);

export const ReportRoutes = router;
