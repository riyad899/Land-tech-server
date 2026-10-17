import { Router } from "express";
import { LandRecordController } from "./record.controller";

const router = Router();

router.post("/", LandRecordController.addRecord);
router.post("/deed", LandRecordController.addDeed);
router.get("/case/:landCaseId", LandRecordController.getRecordsByCase);

export const LandRecordRoutes = router;
