import { NextResponse } from "next/server";
import { createSession, attachSessionCookie } from "@/lib/server-auth";
import { escapeSqlValue, executeSql, queryRows } from "@/lib/mysql-cli";
import { hashPassword } from "@/lib/security";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (name.length < 2 || !email || password.length < 6) {
      return NextResponse.json(
        { error: "이름 2자 이상, 이메일, 비밀번호 6자 이상이 필요합니다." },
        { status: 400 },
      );
    }

    const existing = await queryRows(`
      SELECT id
      FROM users
      WHERE email = ${escapeSqlValue(email)}
      LIMIT 1;
    `);

    if (existing.length > 0) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    await executeSql(`
      INSERT INTO users (name, email, password_hash)
      VALUES (
        ${escapeSqlValue(name)},
        ${escapeSqlValue(email)},
        ${escapeSqlValue(hashPassword(password))}
      );
    `);

    const users = await queryRows(`
      SELECT id, name, email
      FROM users
      WHERE email = ${escapeSqlValue(email)}
      LIMIT 1;
    `);

    const user = users[0];
    const token = await createSession(user);
    const response = NextResponse.json({ user }, { status: 201 });
    return attachSessionCookie(response, token);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
