import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { classifyExpense, bulkClassifyExpenses, analyzeExpenses } from "../controllers/aiController";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post("/classify", requireAuth, classifyExpense);
router.post("/classify/bulk", requireAuth, bulkClassifyExpenses);
router.post("/analyze", requireAuth, upload.single("file"), analyzeExpenses);

export default router;
