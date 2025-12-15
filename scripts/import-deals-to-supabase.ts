import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import type { Deal } from "../types/deal";
import { createClient } from "@supabase/supabase-js";

config();
config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
  }
  const client = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

  const filePath = path.join(process.cwd(), "data", "deals.json");
  console.log("Loading deals from", filePath);
  const raw = await readFile(filePath, "utf-8");
  const deals = JSON.parse(raw) as Deal[];
  if (!Array.isArray(deals) || deals.length === 0) {
    console.log("No deals found in local JSON file.");
    return;
  }

  // Normalise timestamps to ISO strings if missing
  const prepared = deals.map((d) => ({
    ...d,
    createdAt: d.createdAt || new Date().toISOString(),
    updatedAt: d.updatedAt || new Date().toISOString(),
  }));

  const batchSize = Number(process.env.IMPORT_BATCH_SIZE ?? 10);
  console.log(`Importing ${prepared.length} deals to Supabase using batch size ${batchSize}...`);
  const queue = chunk(prepared, Math.max(1, batchSize));
  let processed = 0;
  let attempts = 0;

  while (queue.length > 0) {
    const batch = queue.shift()!;
    attempts += 1;
    const { error } = await client.from("deals").upsert(batch, { onConflict: "id" });
    if (error) {
      const message = `${error.message ?? ""} ${error.details ?? ""}`.trim();
      const is413 = message.includes("413") || message.toLowerCase().includes("entity too large");
      if (is413 && batch.length > 1) {
        const mid = Math.ceil(batch.length / 2);
        console.warn(`Batch of ${batch.length} too large (attempt ${attempts}). Splitting into ${mid} + ${batch.length - mid}.`);
        queue.unshift(batch.slice(mid));
        queue.unshift(batch.slice(0, mid));
        continue;
      }

      console.error("Failed to upsert batch", attempts, message);
      process.exit(1);
    }

    processed += batch.length;
    console.log(`Imported ${processed}/${prepared.length} deals (batch size ${batch.length}).`);
  }

  console.log("Import completed successfully.");
}

main().catch((err) => {
  console.error("Unexpected error while importing deals", err);
  process.exit(1);
});
