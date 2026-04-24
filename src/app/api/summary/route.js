import { NextResponse } from "next/server";
import { escapeSqlValue, queryRows } from "@/lib/mysql-cli";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server-auth";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const totalsRows = await queryRows(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
      COUNT(*) AS transactionCount
    FROM transactions
    WHERE user_id = ${escapeSqlValue(user.id)};
  `);

  const categoryRows = await queryRows(`
    SELECT
      category,
      SUM(amount) AS total
    FROM transactions
    WHERE user_id = ${escapeSqlValue(user.id)}
      AND type = 'expense'
    GROUP BY category
    ORDER BY total DESC;
  `);

  const budgetRows = await queryRows(`
    SELECT category, budget_month AS budgetMonth, limit_amount AS limitAmount
    FROM budgets
    WHERE user_id = ${escapeSqlValue(user.id)}
    ORDER BY budget_month DESC, category ASC;
  `);

  const recentRows = await queryRows(`
    SELECT
      id,
      type,
      category,
      amount,
      note,
      DATE_FORMAT(occurred_at, '%Y-%m-%d') AS occurredAt
    FROM transactions
    WHERE user_id = ${escapeSqlValue(user.id)}
    ORDER BY occurred_at DESC, id DESC
    LIMIT 5;
  `);

  const totals = totalsRows[0] || { income: 0, expense: 0, transactionCount: 0 };
  const income = Number(totals.income || 0);
  const expense = Number(totals.expense || 0);

  return NextResponse.json({
    totals: {
      income,
      expense,
      balance: income - expense,
      transactionCount: Number(totals.transactionCount || 0),
    },
    byCategory: categoryRows.map((item) => ({
      category: item.category,
      total: Number(item.total),
    })),
    budgets: budgetRows.map((item) => ({
      category: item.category,
      budgetMonth: item.budgetMonth,
      limitAmount: Number(item.limitAmount),
    })),
    recent: recentRows.map((item) => ({
      ...item,
      id: Number(item.id),
      amount: Number(item.amount),
    })),
  });
}
