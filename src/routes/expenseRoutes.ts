import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  getMyExpenses,
  deleteExpense,
} from "../controllers/expenseController";

const router = Router();

router.get("/", getExpenses);
router.get("/mine", requireAuth, getMyExpenses);
router.get("/:id", getExpenseById);
router.post("/", requireAuth, createExpense);
router.delete("/:id", requireAuth, deleteExpense);

export default router;
