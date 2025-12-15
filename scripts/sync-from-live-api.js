#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const LIVE_SITE_URL = process.env.LIVE_SITE_URL || "https://coursespeak.com";
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(process.cwd(), "backup");

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
          resolve(data); // Return raw data if not JSON
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

async function fetchAllDeals(baseUrl) {
  console.log(`🔄 Fetching deals from: ${baseUrl}`);

  let allDeals = [];
  let page = 1;
  let hasMorePages = true;
  let emptyPagesCount = 0;
  const maxEmptyPages = 10;

  while (hasMorePages && page <= 50) {
    try {
      const apiUrl = `${baseUrl}/api/deals?page=${page}&pageSize=50`;
      console.log(`📄 Fetching page ${page}...`);

      const response = await fetchWithRetry(apiUrl);

      console.log(`  ✅ Page ${page} fetched`);

      if (response.items && Array.isArray(response.items)) {
        const pageDeals = response.items;
        allDeals = allDeals.concat(pageDeals);

        console.log(`  ✅ Page ${page}: ${pageDeals.length} deals (${allDeals.length} total)`);

        if (pageDeals.length < 50) {
          hasMorePages = false;
        }

        if (pageDeals.length === 0) {
          emptyPagesCount++;
          if (emptyPagesCount >= maxEmptyPages) {
            console.log(`  ℹ️ ${maxEmptyPages} consecutive empty pages, stopping pagination`);
            hasMorePages = false;
          }
        } else {
          emptyPagesCount = 0;
        }

        page++;
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        console.log(`  ❌ Invalid response format, stopping`);
        break;
      }
    } catch (error) {
      console.log(`  ❌ Error fetching page ${page}:`, error.message);
      break;
    }
  }

  console.log(`📊 Fetched ${allDeals.length} total deals from ${page - 1} pages`);
  return allDeals;
}

function validateDeals(deals) {
  if (!Array.isArray(deals)) {
    console.error('❌ Deals data is not an array');
    return false;
  }

  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    const hasId = deal.id || deal.slug;
    const hasTitle = deal.title && typeof deal.title === 'string';
    const hasUrl = deal.url && typeof deal.url === 'string';

    if (hasId && hasTitle && hasUrl) {
      validCount++;
    } else {
      invalidCount++;
      console.warn(`❌ Invalid deal at index ${i}:`, {
        id: deal.id,
        title: deal.title,
        url: deal.url
      });
    }
  }

  console.log(`📊 Validation: ${validCount} valid, ${invalidCount} invalid deals`);
  return invalidCount === 0;
}

async function backupCurrentData(timestamp) {
  const currentDealsFile = path.join(LOCAL_DATA_DIR, 'deals.json');

  try {
    await fs.promises.access(currentDealsFile);

    const currentData = await fs.promises.readFile(currentDealsFile, 'utf-8');
    const deals = JSON.parse(currentData);

    const backupFile = path.join(BACKUP_DIR, `deals_local_before_sync_${timestamp}.json`);
    await fs.promises.writeFile(backupFile, currentData, 'utf-8');

    console.log(`📦 Backed up current local data: ${backupFile}`);
    console.log(`   📊 Current deals: ${deals.length}`);

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

async function saveSync(deals, timestamp) {
  await fs.promises.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.promises.mkdir(BACKUP_DIR, { recursive: true });

  const mainFile = path.join(LOCAL_DATA_DIR, 'deals.json');
  await fs.promises.writeFile(mainFile, JSON.stringify(deals, null, 2), 'utf-8');
  console.log(`💾 Saved ${deals.length} deals to: ${mainFile}`);

  const backupFile = path.join(BACKUP_DIR, `deals_sync_${timestamp}.json`);
  await fs.promises.writeFile(backupFile, JSON.stringify(deals, null, 2), 'utf-8');
  console.log(`📦 Sync backup created: ${backupFile}`);

  const currentBackupFile = path.join(BACKUP_DIR, 'deals_current.json');
  await fs.promises.writeFile(currentBackupFile, JSON.stringify(deals, null, 2), 'utf-8');
  console.log(`📋 Current backup: ${currentBackupFile}`);
}

async function main() {
  console.log('🔄 Syncing deals from live coursespeak.com...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  try {
    const currentDealCount = await backupCurrentData(timestamp);
    console.log('');

    console.log('🔍 Fetching from live site API...');
    const deals = await fetchAllDeals(LIVE_SITE_URL);

    if (deals.length === 0) {
      console.error('❌ No deals found on live site');
      process.exit(1);
    }

    if (!validateDeals(deals)) {
      console.error('❌ Invalid deals data, aborting sync');
      process.exit(1);
    }

    await saveSync(deals, timestamp);

    console.log('\n📈 Sync Summary:');
    console.log(`   📊 Total deals: ${deals.length}`);
    console.log(`   📦 Previous local: ${currentDealCount}`);
    console.log(`   📊 Difference: ${deals.length - currentDealCount}`);

    const providers = new Map();
    const categories = new Map();

    for (const deal of deals) {
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

    console.log('\n✅ Sync completed successfully!');
    console.log('💡 Run "npm run dev" to see the updated deals in your local project.');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 Live API Sync Script

Usage: node scripts/sync-from-live-api.js [options]

Options:
  --url URL     Live site URL (default: https://coursespeak.com)
  --help, -h    Show this help

The script will:
1. Fetch all deals from the live site API
2. Save them to data/deals.json
3. Create timestamped backups
4. Compare with previous local data
5. Validate the data integrity

Examples:
  node scripts/sync-from-live-api.js
  node scripts/sync-from-live-api.js --url https://staging.coursespeak.com
`);
  process.exit(0);
}

// Check for custom URL
const urlArg = args.find((arg, index) => arg === '--url' && args[index + 1]);
if (urlArg) {
  const customUrl = args[args.indexOf('--url') + 1];
  process.env.LIVE_SITE_URL = customUrl.startsWith('http') ? customUrl : `https://${customUrl}`;
  console.log(`🎯 Using custom URL: ${process.env.LIVE_SITE_URL}`);
}

main();
