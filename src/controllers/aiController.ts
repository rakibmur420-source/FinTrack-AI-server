import { Response } from "express";
import { parse } from "csv-parse/sync";
import { groq, GROQ_MODEL } from "../config/groq";
import { AuthRequest } from "../middleware/auth";
import { Expense } from "../models/Expense";

const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing & Utilities",
  "Shopping",
  "Health & Fitness",
  "Entertainment",
  "Education",
  "Travel",
  "Bills & Subscriptions",
  "Other",
];

/**
 * FEATURE A: AI Auto Classification & Tagging
 * @route POST /api/ai/classify   (protected)
 * Takes a single expense description and returns a suggested category + tags
 */
export const classifyExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, shortDescription } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required for classification." });
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expense classification assistant. Given an expense title and description, respond ONLY with valid JSON in this exact shape: {"category": string, "tags": string[]}. Category MUST be one of: ${DEFAULT_CATEGORIES.join(", ")}. Provide 2-4 short lowercase tags. No extra text.`,
        },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${shortDescription || ""}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    res.json({
      category: parsed.category || "Other",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    });
  } catch (error) {
    res.status(500).json({ message: "AI classification failed.", error: (error as Error).message });
  }
};

/**
 * FEATURE A (bulk): Auto-classify all of a user's un-tagged expenses at once
 * @route POST /api/ai/classify/bulk   (protected)
 */
export const bulkClassifyExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await Expense.find({ owner: req.user!.userId, aiTags: { $size: 0 } }).limit(20);

    if (expenses.length === 0) {
      return res.json({ message: "Nothing to classify. All expenses already tagged.", updated: [] });
    }

    const updated = [];
    for (const expense of expenses) {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: `Classify this expense. Respond ONLY with JSON: {"category": string, "tags": string[]}. Category MUST be one of: ${DEFAULT_CATEGORIES.join(", ")}.`,
          },
          { role: "user", content: `Title: ${expense.title}\nDescription: ${expense.shortDescription}` },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      expense.category = parsed.category || expense.category;
      expense.aiTags = Array.isArray(parsed.tags) ? parsed.tags : [];
      await expense.save();
      updated.push(expense);
    }

    res.json({ message: `${updated.length} expenses classified.`, updated });
  } catch (error) {
    res.status(500).json({ message: "Bulk classification failed.", error: (error as Error).message });
  }
};

/**
 * FEATURE B: AI Data Analyzer
 * @route POST /api/ai/analyze   (protected)
 * Accepts either the user's stored expenses or an uploaded CSV file,
 * and returns a structured AI-generated financial analysis report.
 */
export const analyzeExpenses = async (req: AuthRequest, res: Response) => {
  try {
    let expenseData: Array<Record<string, unknown>>;

    if (req.file) {
      // Parse uploaded CSV: expects columns title,amount,date,category
      const records = parse(req.file.buffer.toString("utf-8"), {
        columns: true,
        skip_empty_lines: true,
      });
      expenseData = records;
    } else {
      const expenses = await Expense.find({ owner: req.user!.userId }).sort("-date").limit(100);
      expenseData = expenses.map((e) => ({
        title: e.title,
        amount: e.amount,
        date: e.date,
        category: e.category,
      }));
    }

    if (expenseData.length === 0) {
      return res.status(400).json({ message: "No expense data available to analyze." });
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a financial data analyst AI. Analyze the given expense records and respond ONLY with valid JSON in this shape: " +
            '{"summary": string, "totalSpend": number, "topCategories": [{"category": string, "amount": number, "percentage": number}], ' +
            '"trend": string, "riskFlags": string[], "kpis": [{"label": string, "value": string}], "recommendations": string[]}. ' +
            "Be specific and base every number on the provided data.",
        },
        {
          role: "user",
          content: `Analyze these expense records:\n${JSON.stringify(expenseData).slice(0, 12000)}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
    res.json({ recordCount: expenseData.length, analysis });
  } catch (error) {
    res.status(500).json({ message: "AI analysis failed.", error: (error as Error).message });
  }
};
