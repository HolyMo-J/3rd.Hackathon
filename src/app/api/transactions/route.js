import { NextResponse } from "next/server";
import { escapeSqlValue, executeSql, queryRows } from "@/lib/mysql-cli";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server-auth";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const transactions = await queryRows(`
    SELECT
      id,
      type,
      category,
      amount,
      note,
      DATE_FORMAT(occurred_at, '%Y-%m-%d') AS occurredAt
    FROM transactions
    WHERE user_id = ${escapeSqlValue(user.id)}
    ORDER BY occurred_at DESC, id DESC;
  `);

  return NextResponse.json({
    transactions: transactions.map((item) => ({
      ...item,
      id: Number(item.id),
      amount: Number(item.amount),
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
    const type = String(body.type || "");
    const category = String(body.category || "").trim();
    const note = String(body.note || "").trim();
    const occurredAt = String(body.occurredAt || "");
    const amount = Number(body.amount || 0);

    if (!["income", "expense"].includes(type) || !category || amount <= 0 || !occurredAt) {
      return NextResponse.json({ error: "거래 입력값이 올바르지 않습니다." }, { status: 400 });
    }

    await executeSql(`
      INSERT INTO transactions (user_id, type, category, amount, note, occurred_at)
      VALUES (
        ${escapeSqlValue(user.id)},
        ${escapeSqlValue(type)},
        ${escapeSqlValue(category)},
        ${escapeSqlValue(amount)},
        ${escapeSqlValue(note || null)},
        ${escapeSqlValue(occurredAt)}
      );
    `);

    const rows = await queryRows(`
      SELECT
        id,
        type,
        category,
        amount,
        note,
        DATE_FORMAT(occurred_at, '%Y-%m-%d') AS occurredAt
      FROM transactions
      WHERE user_id = ${escapeSqlValue(user.id)}
      ORDER BY id DESC
      LIMIT 1;
    `);

    const transaction = rows[0];

    return NextResponse.json(
      {
        transaction: {
          ...transaction,
          id: Number(transaction.id),
          amount: Number(transaction.amount),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "거래 등록 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
