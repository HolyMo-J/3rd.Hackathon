import { NextResponse } from "next/server";
import { escapeSqlValue, executeSql } from "@/lib/mysql-cli";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/server-auth";

export async function DELETE(_, { params }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const routeParams = await params;
    const id = Number(routeParams.id);

    await executeSql(`
      DELETE FROM budgets
      WHERE id = ${escapeSqlValue(id)}
        AND user_id = ${escapeSqlValue(user.id)};
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "예산 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
