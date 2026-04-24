import { NextResponse } from "next/server";
import { queryRows } from "@/lib/mysql-cli";

export async function GET() {
  const rows = await queryRows(`
    SELECT
      id,
      bank_name AS bankName,
      product_name AS productName,
      product_type AS productType,
      rate_display AS rateDisplay,
      description
    FROM financial_products
    ORDER BY id ASC;
  `);

  return NextResponse.json({
    products: rows.map((item) => ({
      ...item,
      id: Number(item.id),
    })),
  });
}
