import type { NextResponse } from "next/server";
import { NextResponse as NextResponseClass } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return new NextResponseClass(
    "google.com, pub-8220442576502761, DIRECT, f08c47fec0942fa0\n",
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
