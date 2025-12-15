#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

async function syncFromSupabase() {
  console.log("🔄 Syncing deals from Supabase to local files...");

  try {
    // Import the readDeals function dynamically
    const { readDeals } = require("../lib/store");

    const deals = await readDeals();
    console.log(`📊 Found ${deals.length} deals in Supabase`);

    // Write to local file
    const DATA_DIR = path.join(process.cwd(), "data");
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(DATA_DIR, "deals.json"),
      JSON.stringify(deals, null, 2),
      "utf-8"
    );

    console.log(`✅ Synced ${deals.length} deals to data/deals.json`);

    // Show first few deals
    console.log("\n🔝 First 5 deals:");
    deals.slice(0, 5).forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.title} (${deal.provider})`);
      console.log(`   Updated: ${deal.updatedAt || 'No update date'}`);
    });

  } catch (error) {
    console.error("❌ Error syncing from Supabase:", error.message);
    process.exit(1);
  }
}

syncFromSupabase();
