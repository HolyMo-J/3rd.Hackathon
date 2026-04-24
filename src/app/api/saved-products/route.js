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
      sp.id,
      sp.product_id AS productId,
      fp.bank_name AS bankName,
      fp.product_name AS productName,
      fp.product_type AS productType,
      fp.rate_display AS rateDisplay
    FROM saved_products sp
    JOIN financial_products fp ON fp.id = sp.product_id
    WHERE sp.user_id = ${escapeSqlValue(user.id)}
    ORDER BY sp.id DESC;
  `);

  return NextResponse.json({
    savedProducts: rows.map((item) => ({
      ...item,
      id: Number(item.id),
      productId: Number(item.productId),
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
    const productId = Number(body.productId || 0);

    if (!productId) {
      return NextResponse.json({ error: "상품 ID가 필요합니다." }, { status: 400 });
    }

    await executeSql(`
      INSERT IGNORE INTO saved_products (user_id, product_id)
      VALUES (
        ${escapeSqlValue(user.id)},
        ${escapeSqlValue(productId)}
      );
    `);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "관심 상품 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
