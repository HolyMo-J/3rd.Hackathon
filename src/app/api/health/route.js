import { NextResponse } from "next/server";
import { queryRows } from "@/lib/mysql-cli";

export async function GET() {
  try {
    const rows = await queryRows("SELECT 1 AS ok;");

    return NextResponse.json({
      status: "ok",
      database: rows[0]?.ok === "1" ? "connected" : "unknown",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message || "health check failed",
      },
      { status: 500 },
    );
  }
}
