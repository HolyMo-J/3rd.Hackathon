import { NextResponse } from "next/server";
import { createSession, attachSessionCookie } from "@/lib/server-auth";
import { escapeSqlValue, queryRows } from "@/lib/mysql-cli";
import { verifyPassword } from "@/lib/security";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const users = await queryRows(`
      SELECT id, name, email, password_hash
      FROM users
      WHERE email = ${escapeSqlValue(email)}
      LIMIT 1;
    `);

    const user = users[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    const token = await createSession(user);
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    return attachSessionCookie(response, token);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
