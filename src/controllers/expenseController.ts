import { Response } from "express";
import { Expense } from "../models/Expense";
import { AuthRequest } from "../middleware/auth";

// @route GET /api/expenses
// Public listing page: search + filter (category, date range) + sort + pagination
export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = "",
      category,
      minAmount,
      maxAmount,
      sort = "-date",
      page = "1",
      limit = "8",
    } = req.query;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$text = { $search: search as string };
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (minAmount || maxAmount) {
      query.amount = {
        ...(minAmount ? { $gte: Number(minAmount) } : {}),
        ...(maxAmount ? { $lte: Number(maxAmount) } : {}),
      };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort(sort as string).skip(skip).limit(limitNum),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses.", error: (error as Error).message });
  }
};

// @route GET /api/expenses/:id
export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("owner", "name email photoURL");
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expense.", error: (error as Error).message });
  }
};

// @route POST /api/expenses  (protected)
export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, shortDescription, fullDescription, amount, date, category, imageURL } = req.body;

    if (!title || !shortDescription || !fullDescription || !amount || !date || !category) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const expense = await Expense.create({
      title,
      shortDescription,
      fullDescription,
      amount,
      date,
      category,
      imageURL,
      owner: req.user!.userId,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to create expense.", error: (error as Error).message });
  }
};

// @route GET /api/expenses/mine  (protected - for Manage Items page)
export const getMyExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await Expense.find({ owner: req.user!.userId }).sort("-createdAt");
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your expenses.", error: (error as Error).message });
  }
};

// @route DELETE /api/expenses/:id  (protected)
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });

    if (expense.owner.toString() !== req.user!.userId) {
      return res.status(403).json({ message: "You can only delete your own entries." });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense.", error: (error as Error).message });
  }
};
