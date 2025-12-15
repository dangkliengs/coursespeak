import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "coursespeak_admin_session";

function extractTokenFromRequest(req: NextRequest): string | null {
  const headerToken = req.headers.get("x-admin-token")?.trim();
  if (headerToken) return headerToken;
  
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;
  
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  
  return null;
}

async function setAdminSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function GET(req: NextRequest) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  if (!verifyAdminToken(token)) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  setAdminSession(token);
  const isSecure = process.env.NODE_ENV === "production";
  return NextResponse.json({ authenticated: true }, {
    status: 200,
    headers: {
      'Set-Cookie': `${ADMIN_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=lax; Max-Age=${60 * 60 * 12}${isSecure ? '; Secure' : ''}`
    }
  });
}

export async function DELETE() {
  clearAdminSession();
  return NextResponse.json({ ok: true });
}
