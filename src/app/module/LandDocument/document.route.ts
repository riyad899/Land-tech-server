import { Router } from "express";
import multer from "multer";
import { DocumentController } from "./document.controller";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/upload", upload.single("file"), DocumentController.uploadDocument);
router.get("/case/:landCaseId", DocumentController.getDocumentsByCase);

export const DocumentRoutes = router;
