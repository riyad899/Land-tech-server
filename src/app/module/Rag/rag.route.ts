import { Router } from "express";
import { RagController } from "./rag.controller";

const router = Router();

router.get("/stats", RagController.getStats);
router.get("/popular-questions", RagController.getPopularQuestions);
router.post("/ingest-legal-data", RagController.ingestLegalData);
router.post("/query", RagController.queryRag);

export const RagRoutes = router;
