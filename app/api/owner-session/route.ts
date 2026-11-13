import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/firebase/admin";
import { OWNER_COOKIE } from "@/lib/auth/require-owner";

export const runtime = "nodejs";
const sessionSeconds = 12 * 60 * 60;

function privateJson(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Invalid request origin." }, 403);
  if (Number(request.headers.get("content-length")) > 8192) {
    return privateJson({ message: "Invalid sign-in request." }, 400);
  }

  let idToken: unknown;
  try {
    ({ idToken } = await request.json());
  } catch {
    return privateJson({ message: "Invalid sign-in request." }, 400);
  }
  if (typeof idToken !== "string" || !idToken || idToken.length > 8192) {
    return privateJson({ message: "Invalid sign-in request." }, 400);
  }

  const ownerUid = process.env.FIREBASE_OWNER_UID?.trim();
  if (!ownerUid) return privateJson({ message: "Owner access is unavailable." }, 503);
  const auth = getServerAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken, true);
  } catch {
    return privateJson({ message: "Sign in again and retry." }, 401);
  }
  if (decoded.uid !== ownerUid) return privateJson({ message: "This account is not the portfolio owner." }, 403);
  if (!decoded.auth_time || Date.now() / 1000 - decoded.auth_time > 5 * 60) {
    return privateJson({ message: "Sign in again and retry." }, 401);
  }

  try {
    const session = await auth.createSessionCookie(idToken, { expiresIn: sessionSeconds * 1000 });
    const response = privateJson({ ok: true }, 200);
    response.cookies.set(OWNER_COOKIE, session, {
      httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "strict",
      path: "/", maxAge: sessionSeconds,
    });
    return response;
  } catch {
    return privateJson({ message: "Owner access is temporarily unavailable." }, 503);
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Invalid request origin." }, 403);
  const response = privateJson({ ok: true }, 200);
  response.cookies.set(OWNER_COOKIE, "", {
    httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "strict",
    path: "/", maxAge: 0,
  });
  return response;
}
