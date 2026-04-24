import { NextResponse } from "next/server";
import { escapeSqlValue, executeSql, queryRows } from "@/lib/mysql-cli";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server-auth";

export async function PUT(request, { params }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const routeParams = await params;
    const id = Number(routeParams.id);
    const type = String(body.type || "");
    const category = String(body.category || "").trim();
    const note = String(body.note || "").trim();
    const occurredAt = String(body.occurredAt || "");
    const amount = Number(body.amount || 0);

    if (!id || !["income", "expense"].includes(type) || !category || amount <= 0 || !occurredAt) {
      return NextResponse.json({ error: "거래 입력값이 올바르지 않습니다." }, { status: 400 });
    }

    await executeSql(`
      UPDATE transactions
      SET
        type = ${escapeSqlValue(type)},
        category = ${escapeSqlValue(category)},
        amount = ${escapeSqlValue(amount)},
        note = ${escapeSqlValue(note || null)},
        occurred_at = ${escapeSqlValue(occurredAt)}
      WHERE id = ${escapeSqlValue(id)}
        AND user_id = ${escapeSqlValue(user.id)};
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
      WHERE id = ${escapeSqlValue(id)}
        AND user_id = ${escapeSqlValue(user.id)}
      LIMIT 1;
    `);

    if (rows.length === 0) {
      return NextResponse.json({ error: "대상 거래를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      transaction: {
        ...rows[0],
        id: Number(rows[0].id),
        amount: Number(rows[0].amount),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "거래 수정 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_, { params }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const routeParams = await params;
    const id = Number(routeParams.id);

    await executeSql(`
      DELETE FROM transactions
      WHERE id = ${escapeSqlValue(id)}
        AND user_id = ${escapeSqlValue(user.id)};
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "거래 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
