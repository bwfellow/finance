import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  incomeFields,
  validateDate,
  validateAmount,
  validateString,
} from "../shared/validators";
import * as IncomeModel from "./model";

export const addIncome = mutation({
  args: incomeFields,
  handler: async (ctx, { description, amount, date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    validateDate(date);
    validateAmount(amount);
    validateString(description, "Description");
    const month = date.slice(0, 7); // "YYYY-MM"
    return IncomeModel.insertIncome(ctx, {
      userId,
      description,
      amount,
      month,
      date,
    });
  },
});

export const deleteIncome = mutation({
  args: { incomeId: v.id("incomeEntries") },
  handler: async (ctx, { incomeId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const incomeEntry = await IncomeModel.getIncome(ctx, incomeId);
    if (!incomeEntry || incomeEntry.userId !== userId) {
      throw new Error("Income entry not found");
    }
    await IncomeModel.deleteIncome(ctx, incomeId);
  },
});
