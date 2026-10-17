import { Router } from "express";
import { LandCaseController } from "./case.controller";

const router = Router();

router.post("/", LandCaseController.createCase);
router.get("/", LandCaseController.getAllCases);
router.get("/:id", LandCaseController.getCaseById);
router.patch("/:id", LandCaseController.updateCase);
router.delete("/:id", LandCaseController.deleteCase);

export const LandCaseRoutes = router;
