import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    adminPassword: process.env.ADMIN_PASSWORD || "NOT SET",
    cwd: process.cwd(),
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
