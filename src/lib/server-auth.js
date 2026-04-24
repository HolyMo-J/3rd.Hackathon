import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { escapeSqlValue, executeSql, queryRows } from "@/lib/mysql-cli";
import { signToken, verifyToken } from "@/lib/security";

const AUTH_COOKIE = "pfm_token";
const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export async function createSession(user) {
  const expiresAt = Math.floor(Date.now() / 1000) + SEVEN_DAYS_IN_SECONDS;
  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: expiresAt,
  });

  await executeSql(`
    INSERT INTO user_sessions (user_id, jwt_token, expires_at)
    VALUES (
      ${escapeSqlValue(user.id)},
      ${escapeSqlValue(token)},
      FROM_UNIXTIME(${escapeSqlValue(expiresAt)})
    );
  `);

  return token;
}

export function attachSessionCookie(response, token) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  });

  return response;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    await executeSql(`
      DELETE FROM user_sessions
      WHERE jwt_token = ${escapeSqlValue(token)};
    `);
  }
}

export function clearSessionCookie(response) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const sessionRows = await queryRows(`
    SELECT user_id
    FROM user_sessions
    WHERE jwt_token = ${escapeSqlValue(token)}
      AND expires_at > NOW()
    LIMIT 1;
  `);

  if (sessionRows.length === 0) {
    return null;
  }

  const users = await queryRows(`
    SELECT id, name, email
    FROM users
    WHERE id = ${escapeSqlValue(payload.sub)}
    LIMIT 1;
  `);

  return users[0] || null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
}
