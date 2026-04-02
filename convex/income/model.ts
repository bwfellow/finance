import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function insertIncome(
  ctx: MutationCtx,
  data: {
    userId: Id<"users">;
    description: string;
    amount: number;
    month: string;
    date: string;
  },
) {
  return ctx.db.insert("incomeEntries", data);
}

export async function getIncome(
  ctx: QueryCtx | MutationCtx,
  incomeId: Id<"incomeEntries">,
) {
  return ctx.db.get(incomeId);
}

export async function deleteIncome(
  ctx: MutationCtx,
  incomeId: Id<"incomeEntries">,
) {
  await ctx.db.delete(incomeId);
}

export async function getIncomeForUserAndMonth(
  ctx: QueryCtx,
  userId: Id<"users">,
  month: string,
) {
  return ctx.db
    .query("incomeEntries")
    .withIndex("by_user_and_month", (q) => q.eq("userId", userId).eq("month", month))
    .collect();
}

export async function getAllIncomeForUser(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("incomeEntries")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}
