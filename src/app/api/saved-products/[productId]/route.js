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
    const productId = Number(routeParams.productId);

    await executeSql(`
      DELETE FROM saved_products
      WHERE user_id = ${escapeSqlValue(user.id)}
        AND product_id = ${escapeSqlValue(productId)};
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "관심 상품 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
