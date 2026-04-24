import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "hackathon-demo-secret";
}

export function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getJwtSecret())
    .update(unsigned)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${unsigned}.${signature}`;
}

export function verifyToken(token) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac("sha256", getJwtSecret())
      .update(unsigned)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const left = Buffer.from(signature);
    const right = Buffer.from(expectedSignature);

    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashed}`;
}

export function verifyPassword(password, storedValue) {
  const [salt, hashed] = String(storedValue || "").split(":");

  if (!salt || !hashed) {
    return false;
  }

  const original = Buffer.from(hashed, "hex");
  const attempted = scryptSync(password, salt, 64);

  return original.length === attempted.length && timingSafeEqual(original, attempted);
}
