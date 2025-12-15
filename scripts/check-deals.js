#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DEALS_PATH = process.env.DEALS_PATH
  ? path.resolve(process.env.DEALS_PATH)
  : path.join(process.cwd(), "data", "deals.json");

function loadDeals(file) {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const json = JSON.parse(raw);
    if (!Array.isArray(json)) {
      throw new Error("deals.json must be an array");
    }
    return json;
  } catch (error) {
    console.error(`Failed to read deals from ${file}:`, error.message);
    process.exitCode = 1;
    return [];
  }
}

function summarize(deals) {
  const total = deals.length;
  const providers = new Map();
  const categories = new Map();

  for (const deal of deals) {
    const provider = String(deal.provider || "unknown").toLowerCase();
    providers.set(provider, (providers.get(provider) || 0) + 1);

    const category = String(deal.category || "uncategorized").toLowerCase();
    categories.set(category, (categories.get(category) || 0) + 1);
  }

  console.log(`Loaded ${total} deals.`);
  console.log("Top providers:");
  [...providers.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([provider, count]) => {
      console.log(`  ${provider}: ${count}`);
    });

  console.log("Top categories:");
  [...categories.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
}

function checkDuplicates(deals) {
  const seen = new Set();
  let duplicates = 0;
  for (const deal of deals) {
    const id = String(deal.id || deal.slug || "");
    if (!id) continue;
    if (seen.has(id)) {
      duplicates += 1;
      console.warn(`Duplicate deal detected: ${id}`);
    } else {
      seen.add(id);
    }
  }
  if (duplicates > 0) {
    process.exitCode = 2;
    console.warn(`Found ${duplicates} duplicate deal entries.`);
  }
}

function main() {
  const deals = loadDeals(DEALS_PATH);
  if (deals.length === 0) {
    console.warn("No deals found. Check data source.");
    process.exitCode = process.exitCode || 1;
    return;
  }

  summarize(deals);
  checkDuplicates(deals);

  if (!process.exitCode) {
    console.log("Deal check completed successfully.");
  }
}

main();
