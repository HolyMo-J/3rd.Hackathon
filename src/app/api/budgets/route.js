import { NextResponse } from "next/server";
import { escapeSqlValue, executeSql, queryRows } from "@/lib/mysql-cli";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server-auth";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const rows = await queryRows(`
    SELECT
      id,
      category,
      budget_month AS budgetMonth,
      limit_amount AS limitAmount
    FROM budgets
    WHERE user_id = ${escapeSqlValue(user.id)}
    ORDER BY budget_month DESC, category ASC;
  `);

  return NextResponse.json({
    budgets: rows.map((item) => ({
      ...item,
      id: Number(item.id),
      limitAmount: Number(item.limitAmount),
    })),
  });
}

export async function POST(request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const category = String(body.category || "").trim();
    const budgetMonth = String(body.budgetMonth || "").trim();
    const limitAmount = Number(body.limitAmount || 0);

    if (!category || !budgetMonth || limitAmount <= 0) {
      return NextResponse.json({ error: "예산 입력값이 올바르지 않습니다." }, { status: 400 });
    }

    await executeSql(`
      INSERT INTO budgets (user_id, category, budget_month, limit_amount)
      VALUES (
        ${escapeSqlValue(user.id)},
        ${escapeSqlValue(category)},
        ${escapeSqlValue(budgetMonth)},
        ${escapeSqlValue(limitAmount)}
      )
      ON DUPLICATE KEY UPDATE
        limit_amount = VALUES(limit_amount),
        updated_at = CURRENT_TIMESTAMP;
    `);

    const rows = await queryRows(`
      SELECT
        id,
        category,
        budget_month AS budgetMonth,
        limit_amount AS limitAmount
      FROM budgets
      WHERE user_id = ${escapeSqlValue(user.id)}
        AND category = ${escapeSqlValue(category)}
        AND budget_month = ${escapeSqlValue(budgetMonth)}
      LIMIT 1;
    `);

    return NextResponse.json({
      budget: {
        ...rows[0],
        id: Number(rows[0].id),
        limitAmount: Number(rows[0].limitAmount),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "예산 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
