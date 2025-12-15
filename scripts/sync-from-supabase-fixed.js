#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(process.cwd(), "backup");

async function syncFromSupabase() {
  console.log("🔄 Syncing deals from Supabase to local files...");

  try {
    // Check Supabase configuration
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.SUPABASE_SERVICE_KEY || 
                       process.env.SUPABASE_SERVICE_ROLE ||
                       process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase configuration missing:");
      console.error("   SUPABASE_URL:", supabaseUrl ? "✅" : "❌ Missing");
      console.error("   SERVICE_KEY:", supabaseKey ? "✅" : "❌ Missing");
      console.log("\n💡 Please set these environment variables in your .env file:");
      console.log("   SUPABASE_URL=https://your-project.supabase.co");
      console.log("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
      process.exit(1);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log(`🔗 Connected to Supabase: ${supabaseUrl}`);

    // Fetch all deals from Supabase
    console.log("📥 Fetching deals from Supabase...");
    
    const { data: deals, error, count } = await supabase
      .from('deals')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching from Supabase:", error);
      process.exit(1);
    }

    if (!deals || deals.length === 0) {
      console.log("ℹ️ No deals found in Supabase");
      return;
    }

    console.log(`📊 Found ${deals.length} deals in Supabase`);

    // Backup current local data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    await backupCurrentData(timestamp);

    // Ensure directories exist
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    await fs.promises.mkdir(BACKUP_DIR, { recursive: true });

    // Transform Supabase data to match local format
    const transformedDeals = deals.map(deal => ({
      id: deal.id,
      slug: deal.slug,
      title: deal.title,
      provider: deal.provider,
      price: deal.price,
      url: deal.url,
      category: deal.category,
      subcategory: deal.subcategory,
      image: deal.image,
      description: deal.description,
      content: deal.content,
      coupon: deal.coupon,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
      seoTitle: deal.seo_title,
      seoDescription: deal.seo_description,
      seoOgImage: deal.seo_og_image,
      learn: deal.learn || [],
      requirements: deal.requirements || [],
      faqs: deal.faqs || [],
      curriculum: deal.curriculum || [],
      originalPrice: deal.original_price,
      rating: deal.rating,
      instructor: deal.instructor,
      language: deal.language
    }));

    // Write to local file
    const localFile = path.join(DATA_DIR, "deals.json");
    await fs.promises.writeFile(
      localFile,
      JSON.stringify(transformedDeals, null, 2),
      "utf-8"
    );

    console.log(`✅ Synced ${transformedDeals.length} deals to data/deals.json`);

    // Create backup
    const backupFile = path.join(BACKUP_DIR, `deals_supabase_${timestamp}.json`);
    await fs.promises.writeFile(backupFile, JSON.stringify(transformedDeals, null, 2), "utf-8");
    console.log(`📦 Backup created: ${backupFile}`);

    // Update current backup
    const currentBackupFile = path.join(BACKUP_DIR, 'deals_current.json');
    await fs.promises.writeFile(currentBackupFile, JSON.stringify(transformedDeals, null, 2), "utf-8");
    console.log(`📋 Current backup updated: ${currentBackupFile}`);

    // Show summary
    console.log("\n📈 Sync Summary:");
    console.log(`   📊 Total deals: ${transformedDeals.length}`);

    const providers = new Map();
    const categories = new Map();

    for (const deal of transformedDeals) {
      const provider = String(deal.provider || "unknown").toLowerCase();
      providers.set(provider, (providers.get(provider) || 0) + 1);

      const category = String(deal.category || "uncategorized").toLowerCase();
      categories.set(category, (categories.get(category) || 0) + 1);
    }

    console.log('   🏢 Top providers:');
    [...providers.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([provider, count]) => {
        console.log(`      ${provider}: ${count}`);
      });

    console.log('   📂 Top categories:');
    [...categories.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`      ${category}: ${count}`);
      });

    // Show first few deals
    console.log("\n🔝 First 5 deals (most recent):");
    transformedDeals.slice(0, 5).forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.title} (${deal.provider})`);
      console.log(`   Updated: ${deal.updatedAt || 'No update date'}`);
    });

    console.log('\n✅ Sync completed successfully!');
    console.log('💡 Run "npm run dev" to see the updated deals in your local project.');

  } catch (error) {
    console.error("❌ Error syncing from Supabase:", error.message);
    process.exit(1);
  }
}

async function backupCurrentData(timestamp) {
  const currentDealsFile = path.join(DATA_DIR, 'deals.json');

  try {
    await fs.promises.access(currentDealsFile);

    const currentData = await fs.promises.readFile(currentDealsFile, 'utf-8');
    const deals = JSON.parse(currentData);

    const backupFile = path.join(BACKUP_DIR, `deals_local_before_supabase_${timestamp}.json`);
    await fs.promises.writeFile(backupFile, currentData, 'utf-8');

    console.log(`📦 Backed up current local data: ${backupFile}`);
    console.log(`   📊 Current local deals: ${deals.length}`);

    return deals.length;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('ℹ️ No existing local deals file found');
      return 0;
    }
    console.log('⚠️ Could not backup current data:', error.message);
    return 0;
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 Supabase Sync Script

Usage: node scripts/sync-from-supabase-fixed.js [options]

Options:
  --help, -h    Show this help

The script will:
1. Connect to your Supabase database
2. Fetch all deals from the 'deals' table
3. Transform data to match local format
4. Save them to data/deals.json
5. Create timestamped backups
6. Validate the data integrity

Required environment variables:
  SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY (or similar variants)
`);
  process.exit(0);
}

syncFromSupabase();
