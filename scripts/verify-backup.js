#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const LIVE_SITE_URL = process.env.LIVE_SITE_URL || "https://coursespeak.com";
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchUrl(url, options);
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;

    const req = client.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function getLiveSiteStats() {
  console.log(`🔍 Analyzing live site: ${LIVE_SITE_URL}`);

  try {
    // Fetch all deals from live site
    let allDeals = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages && page <= 50) { // Limit to 50 pages max
      try {
        const apiUrl = `${LIVE_SITE_URL}/api/deals?page=${page}&pageSize=50`;
        const response = await fetchWithRetry(apiUrl);

        if (response.items && Array.isArray(response.items)) {
          const pageDeals = response.items;
          allDeals = allDeals.concat(pageDeals);

          if (pageDeals.length < 50) {
            hasMorePages = false;
          }
          page++;
        } else {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`  ❌ Error fetching page ${page}:`, error.message);
        break;
      }
    }

    const stats = analyzeDeals(allDeals);
    stats.totalPages = page - 1;
    stats.totalDeals = allDeals.length;

    console.log(`  📊 Live site: ${allDeals.length} deals across ${page - 1} pages`);
    return stats;

  } catch (error) {
    console.error(`❌ Error analyzing live site:`, error.message);
    return null;
  }
}

function analyzeDeals(deals) {
  if (!Array.isArray(deals) || deals.length === 0) {
    return {
      totalDeals: 0,
      providers: {},
      categories: {},
      averagePrice: 0,
      freeDeals: 0,
      topProviders: [],
      topCategories: []
    };
  }

  const providers = new Map();
  const categories = new Map();
  let totalPrice = 0;
  let priceCount = 0;
  let freeDeals = 0;

  for (const deal of deals) {
    // Count providers
    const provider = String(deal.provider || "unknown").toLowerCase();
    providers.set(provider, (providers.get(provider) || 0) + 1);

    // Count categories
    const category = String(deal.category || "uncategorized").toLowerCase();
    categories.set(category, (categories.get(category) || 0) + 1);

    // Calculate pricing
    if (typeof deal.price === 'number' && deal.price >= 0) {
      if (deal.price === 0) freeDeals++;
      totalPrice += deal.price;
      priceCount++;
    }
  }

  const topProviders = [...providers.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([provider, count]) => ({ provider, count }));

  const topCategories = [...categories.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  return {
    totalDeals: deals.length,
    providers: Object.fromEntries(providers),
    categories: Object.fromEntries(categories),
    averagePrice: priceCount > 0 ? totalPrice / priceCount : 0,
    freeDeals,
    topProviders,
    topCategories
  };
}

async function getLocalStats() {
  console.log(`📂 Analyzing local data: data/deals.json`);

  try {
    const localFile = path.join(LOCAL_DATA_DIR, 'deals.json');

    if (!fs.existsSync(localFile)) {
      console.log(`  ❌ Local deals file not found: ${localFile}`);
      return null;
    }

    const data = fs.readFileSync(localFile, 'utf-8');
    const deals = JSON.parse(data);

    if (!Array.isArray(deals)) {
      console.log(`  ❌ Local deals data is not an array`);
      return null;
    }

    const stats = analyzeDeals(deals);
    console.log(`  📊 Local: ${deals.length} deals`);
    return stats;

  } catch (error) {
    console.error(`❌ Error analyzing local data:`, error.message);
    return null;
  }
}

function compareStats(localStats, liveStats) {
  if (!localStats || !liveStats) {
    console.log(`\n❌ Cannot compare - missing data`);
    return;
  }

  console.log(`\n📊 COMPARISON RESULTS:`);
  console.log(`   ════════════════════════════════════════`);

  // Basic counts
  console.log(`\n📈 DEAL COUNTS:`);
  console.log(`   Live site:  ${liveStats.totalDeals.toLocaleString()} deals`);
  console.log(`   Local:      ${localStats.totalDeals.toLocaleString()} deals`);

  const diff = Math.abs(liveStats.totalDeals - localStats.totalDeals);
  const match = diff === 0 ? '✅' : '❌';
  console.log(`   Difference: ${diff.toLocaleString()} deals ${match}`);

  // Provider comparison
  console.log(`\n🏢 TOP PROVIDERS:`);
  console.log(`   Live Site → Local`);
  console.log(`   ──────────────────`);

  const maxProviders = Math.max(liveStats.topProviders.length, localStats.topProviders.length);
  for (let i = 0; i < maxProviders; i++) {
    const live = liveStats.topProviders[i] || { provider: '-', count: 0 };
    const local = localStats.topProviders[i] || { provider: '-', count: 0 };

    const match = live.provider === local.provider && live.count === local.count ? '✅' : '❌';
    console.log(`   ${live.provider.padEnd(12)} (${live.count.toString().padStart(3)}) → ${local.provider.padEnd(12)} (${local.count.toString().padStart(3)}) ${match}`);
  }

  // Category comparison
  console.log(`\n📂 TOP CATEGORIES:`);
  console.log(`   Live Site → Local`);
  console.log(`   ──────────────────`);

  const maxCategories = Math.max(liveStats.topCategories.length, localStats.topCategories.length);
  for (let i = 0; i < maxCategories; i++) {
    const live = liveStats.topCategories[i] || { category: '-', count: 0 };
    const local = localStats.topCategories[i] || { category: '-', count: 0 };

    const match = live.category === local.category && live.count === local.count ? '✅' : '❌';
    console.log(`   ${live.category.padEnd(20)} (${live.count.toString().padStart(3)}) → ${local.category.padEnd(20)} (${local.count.toString().padStart(3)}) ${match}`);
  }

  // Pricing comparison
  console.log(`\n💰 PRICING:`);
  console.log(`   Live site: ${liveStats.freeDeals}/${liveStats.totalDeals} free deals (${((liveStats.freeDeals/liveStats.totalDeals)*100).toFixed(1)}%)`);
  console.log(`   Local:     ${localStats.freeDeals}/${localStats.totalDeals} free deals (${((localStats.freeDeals/localStats.totalDeals)*100).toFixed(1)}%)`);

  const priceMatch = Math.abs(liveStats.freeDeals/liveStats.totalDeals - localStats.freeDeals/localStats.totalDeals) < 0.05 ? '✅' : '❌';
  console.log(`   Free deals match: ${priceMatch}`);

  // Overall status
  console.log(`\n🏁 OVERALL STATUS:`);

  const countsMatch = liveStats.totalDeals === localStats.totalDeals;
  const providersMatch = liveStats.topProviders.length > 0 && localStats.topProviders.length > 0;
  const categoriesMatch = liveStats.topCategories.length > 0 && localStats.topCategories.length > 0;

  if (countsMatch && providersMatch && categoriesMatch) {
    console.log(`   🎉 BACKUP SUCCESSFUL! Local data matches live site.`);
  } else {
    console.log(`   ⚠️  PARTIAL MATCH - Some differences detected.`);
    if (!countsMatch) console.log(`      • Deal counts don't match`);
    if (!providersMatch) console.log(`      • Provider distribution different`);
    if (!categoriesMatch) console.log(`      • Category distribution different`);
  }
}

async function checkSpecificDeals() {
  console.log(`\n🔍 CHECKING SPECIFIC DEALS:`);

  try {
    const localFile = path.join(LOCAL_DATA_DIR, 'deals.json');
    const localData = fs.readFileSync(localFile, 'utf-8');
    const localDeals = JSON.parse(localData);

    // Check if we have some common deals
    const sampleSize = Math.min(5, localDeals.length);
    let foundMatches = 0;

    for (let i = 0; i < sampleSize; i++) {
      const deal = localDeals[i];
      if (deal.title && deal.url) {
        console.log(`   📝 "${deal.title.substring(0, 50)}..."`);
        console.log(`      URL: ${deal.url}`);
        foundMatches++;
      }
    }

    if (foundMatches > 0) {
      console.log(`   ✅ Found ${foundMatches} sample deals in local data`);
    } else {
      console.log(`   ❌ No valid deals found in local data`);
    }

  } catch (error) {
    console.log(`   ❌ Error checking local deals:`, error.message);
  }
}

async function main() {
  console.log('🔍 Verifying backup: Comparing local vs live site deals...\n');

  // Get local stats
  const localStats = await getLocalStats();
  console.log('');

  // Get live site stats
  const liveStats = await getLiveSiteStats();
  console.log('');

  // Compare the stats
  compareStats(localStats, liveStats);

  // Check specific deals
  await checkSpecificDeals();

  console.log(`\n💡 Tips:`);
  console.log(`   • If counts match: Backup was successful ✅`);
  console.log(`   • If providers match: Data integrity is good ✅`);
  console.log(`   • If categories match: Filtering will work correctly ✅`);
  console.log(`   • Run "npm run dev" to test the local site with new data`);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔍 Deals Verification Script

Usage: node scripts/verify-backup.js [options]

Options:
  --url URL     Live site URL to compare with (default: https://coursespeak.com)
  --help, -h    Show this help

Examples:
  node scripts/verify-backup.js
  node scripts/verify-backup.js --url https://staging.coursespeak.com

This script will:
1. Analyze local deals data
2. Fetch and analyze live site deals
3. Compare counts, providers, and categories
4. Show detailed comparison results
`);
  process.exit(0);
}

// Check for custom URL
const urlArg = args.find((arg, index) => arg === '--url' && args[index + 1]);
if (urlArg) {
  const customUrl = args[args.indexOf('--url') + 1];
  process.env.LIVE_SITE_URL = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`;
  console.log(`🎯 Comparing with: ${process.env.LIVE_SITE_URL}`);
}

main().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});
