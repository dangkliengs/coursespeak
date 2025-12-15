import { promises as fs } from "fs";
import path from "path";
import type { Deal } from "@/types/deal";
import { deals as mockDeals } from "@/lib/mockData";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");

function resolveDealsFilePath(): string {
  const raw = process.env.DEALS_PATH?.trim();
  if (!raw) {
    return path.join(DEFAULT_DATA_DIR, "deals.json");
  }
  let resolved = path.resolve(raw);
  if (!path.extname(resolved)) {
    resolved = path.join(resolved, "deals.json");
  }
  return resolved;
}

const DEALS_FILE = resolveDealsFilePath();
const DEALS_DIR = path.dirname(DEALS_FILE);

export async function readDealsFromFile(): Promise<Deal[]> {
  try {
    const buf = await fs.readFile(DEALS_FILE, "utf-8");
    const data = JSON.parse(buf) as Deal[];
    if (Array.isArray(data)) {
      return data;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeDealsToFile(mockDeals);
    }
    return mockDeals;
  }
  return mockDeals;
}

async function writeDealsToFile(all: Deal[]): Promise<void> {
  await fs.mkdir(DEALS_DIR, { recursive: true });
  await fs.writeFile(DEALS_FILE, JSON.stringify(all, null, 2), "utf-8");
}

function sortByRecency(deals: Deal[]): Deal[] {
  return [...deals].sort((a, b) => {
    // Match homepage sorting: updatedAt || createdAt || expiresAt
    const timeA = new Date(a.updatedAt ?? a.createdAt ?? a.expiresAt ?? 0).getTime();
    const timeB = new Date(b.updatedAt ?? b.createdAt ?? b.expiresAt ?? 0).getTime();
    return timeB - timeA;  // Newest first
  });
}

export async function readDeals(): Promise<Deal[]> {
  const deals = await readDealsFromFile();
  return sortByRecency(deals);
}

export async function getDealById(idOrSlug: string): Promise<Deal | null> {
  const key = String(idOrSlug);
  const all = await readDealsFromFile();
  return all.find((deal) => deal.id === key || deal.slug === key) ?? null;
}

export async function createDeal(deal: Deal): Promise<Deal> {
  const all = await readDealsFromFile();
  if (all.some((item) => item.id === deal.id)) {
    throw new Error("ID already exists");
  }
  if (deal.slug && all.some((item) => item.slug === deal.slug)) {
    throw new Error("Slug already exists");
  }
  const now = new Date().toISOString();
  const next: Deal = {
    ...deal,
    createdAt: deal.createdAt ?? now,
    updatedAt: deal.updatedAt ?? now,
  };
  all.unshift(next);
  const sortedAll = sortByRecency(all);
  await writeDealsToFile(sortedAll);
  return next;
}

export async function updateDeal(id: string, patch: Partial<Deal>): Promise<Deal | null> {
  try {
    console.log(`Updating deal ${id} with:`, patch);
    const deals = await readDealsFromFile();
    const index = deals.findIndex((d) => d.id === id);

    if (index === -1) {
      console.error(`Deal with id ${id} not found`);
      return null;
    }

    const updated = {
      ...deals[index],
      ...patch,
      updatedAt: new Date().toISOString()
    };

    deals[index] = updated;
    const sortedDeals = sortByRecency(deals);
    await writeDealsToFile(sortedDeals);

    console.log('File write attempted. Checking if file updated:');
    const afterUpdate = await readDealsFromFile();
    const updatedDeal = afterUpdate.find(d => d.id === id);
    console.log('Deal in file after update:', JSON.stringify(updatedDeal, null, 2));
    console.log(`Successfully updated deal ${id}`);
    return updated;
  } catch (error) {
    console.error(`Error updating deal ${id}:`, error);
    throw error;
  }
}

export async function deleteDeal(id: string): Promise<void> {
  const all = await readDealsFromFile();
  const next = all.filter((deal) => deal.id !== id);
  if (next.length === all.length) {
    throw new Error("Not found");
  }
  const sortedDeals = sortByRecency(next);
  await writeDealsToFile(sortedDeals);
}

export async function writeDeals(all: Deal[]): Promise<void> {
  await writeDealsToFile(all);
}
