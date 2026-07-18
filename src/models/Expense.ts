import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  amount: number;
  date: Date;
  category: string;
  aiTags: string[];
  imageURL?: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    aiTags: { type: [String], default: [] },
    imageURL: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ title: "text", shortDescription: "text", category: "text" });

export const Expense = mongoose.model<IExpense>("Expense", expenseSchema);
