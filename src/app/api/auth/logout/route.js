import { NextResponse } from "next/server";
import { clearSession, clearSessionCookie } from "@/lib/server-auth";

export async function POST() {
  await clearSession();
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
