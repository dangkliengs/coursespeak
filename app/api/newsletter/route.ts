import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "newsletter-subscribers.json");

async function readSubscribers() {
  try {
    const buf = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
    const parsed = JSON.parse(buf) as Array<{ email: string; subscribedAt: string }>;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(SUBSCRIBERS_FILE, "[]", "utf-8");
      return [];
    }
    throw error;
  }
}

async function writeSubscribers(list: Array<{ email: string; subscribedAt: string }>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { email?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    const subscribers = await readSubscribers();
    if (subscribers.some((entry) => entry.email === email)) {
      return NextResponse.json({ message: "You are already subscribed." }, { status: 200 });
    }

    const entry = { email, subscribedAt: new Date().toISOString() };
    subscribers.push(entry);
    await writeSubscribers(subscribers);

    return NextResponse.json({ message: "Subscription successful." }, { status: 200 });
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    return NextResponse.json({ message: "Unable to process subscription." }, { status: 500 });
  }
}
