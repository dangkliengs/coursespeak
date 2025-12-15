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
  const maxEmptyPages = 10; // Stop after 10 consecutive empty pages

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

        // Check if this page has fewer than expected deals
        if (pageDeals.length < 50) {
          hasMorePages = false;
        }

        // Check if this page is empty
        if (pageDeals.length === 0) {
          emptyPagesCount++;
          if (emptyPagesCount >= maxEmptyPages) {
            console.log(`  ℹ️ ${maxEmptyPages} consecutive empty pages, stopping pagination`);
            hasMorePages = false;
          }
        } else {
          emptyPagesCount = 0; // Reset counter on non-empty page
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

async function backupCurrentData() {
  const currentDealsFile = path.join(LOCAL_DATA_DIR, 'deals.json');

  try {
    await fs.promises.access(currentDealsFile);

    const currentData = await fs.promises.readFile(currentDealsFile, 'utf-8');
    const deals = JSON.parse(currentData);

    const backupFile = path.join(BACKUP_DIR, `deals_local_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
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

async function saveBackup(deals, timestamp) {
  await fs.promises.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.promises.mkdir(BACKUP_DIR, { recursive: true });

  const mainFile = path.join(LOCAL_DATA_DIR, 'deals.json');
  await fs.promises.writeFile(mainFile, JSON.stringify(deals, null, 2), 'utf-8');
  console.log(`💾 Saved ${deals.length} deals to: ${mainFile}`);

  const backupFile = path.join(BACKUP_DIR, `deals_backup_${timestamp}.json`);
  await fs.promises.writeFile(backupFile, JSON.stringify(deals, null, 2), 'utf-8');
  console.log(`📦 Backup created: ${backupFile}`);

  const currentBackupFile = path.join(BACKUP_DIR, 'deals_current.json');
  await fs.promises.writeFile(currentBackupFile, JSON.stringify(deals, null, 2), 'utf-8');
  console.log(`📋 Current backup: ${currentBackupFile}`);
}

async function generateSitemap(deals) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://coursespeak.com";
  const now = new Date();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Static routes
  const staticRoutes = [
    { url: `${baseUrl}/`, priority: "1.0", changeFreq: "daily" },
    { url: `${baseUrl}/search`, priority: "0.8", changeFreq: "weekly" },
    { url: `${baseUrl}/categories`, priority: "0.9", changeFreq: "daily" },
    { url: `${baseUrl}/udemy-coupons`, priority: "0.8", changeFreq: "daily" },
    { url: `${baseUrl}/sitemap`, priority: "0.3", changeFreq: "monthly" },
    { url: `${baseUrl}/contact`, priority: "0.5", changeFreq: "monthly" },
    { url: `${baseUrl}/api/newsletter`, priority: "0.2", changeFreq: "weekly" }
  ];

  // Add static routes
  staticRoutes.forEach(route => {
    sitemap += `  <url>
    <loc>${route.url}</loc>
    <lastmod>${now.toISOString()}</lastmod>
    <changefreq>${route.changeFreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  });

  // Add individual deal pages
  deals.forEach(deal => {
    const dealUrl = `${baseUrl}/deal/${deal.slug || deal.id}`;
    const lastMod = deal.updatedAt || deal.createdAt || now.toISOString();

    sitemap += `  <url>
    <loc>${dealUrl}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Collect categories
  const categories = new Map();
  deals.forEach(deal => {
    const category = (deal.category || "uncategorized").toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (category && category !== "uncategorized") {
      const lastMod = deal.updatedAt || deal.createdAt;
      const existing = categories.get(category);

      if (!existing || (lastMod && new Date(lastMod) > new Date(existing))) {
        categories.set(category, lastMod);
      }
    }
  });

  // Add category pages
  categories.forEach((lastMod, category) => {
    const categoryUrl = `${baseUrl}/?category=${encodeURIComponent(category)}`;
    sitemap += `  <url>
    <loc>${categoryUrl}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  // Write sitemap to public directory
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemap, "utf-8");

  console.log(`✅ Sitemap generated: ${sitemapPath}`);
  console.log(`📊 Contains ${staticRoutes.length + deals.length + categories.size} URLs`);
}

async function main() {
  console.log('🚀 Starting backup from coursespeak.com...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  try {
    const currentDealCount = await backupCurrentData();
    console.log('');

    console.log('🔍 Trying to fetch from live site...');
    const deals = await fetchAllDeals(LIVE_SITE_URL);

    if (deals.length === 0) {
      console.error('❌ No deals found on live site');
      process.exit(1);
    }

    if (!validateDeals(deals)) {
      console.error('❌ Invalid deals data, aborting backup');
      process.exit(1);
    }

    await saveBackup(deals, timestamp);

    console.log('\n📄 Generating updated sitemap...');
    await generateSitemap(deals);

    console.log('\n📈 Backup Summary:');
    console.log(`   📊 Total deals: ${deals.length}`);

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

    console.log('\n✅ Backup completed successfully!');
    console.log('💡 Run "npm run dev" to see the updated deals in your local project.');

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 Deals Backup Script

Usage: node scripts/backup-from-live.js [options]

Options:
  --url URL     Live site URL (default: https://coursespeak.com)
  --help, -h    Show this help

Examples:
  node scripts/backup-from-live.js
  node scripts/backup-from-live.js --url https://staging.coursespeak.com

The script will:
1. Fetch all deals from the live site API
2. Save them to data/deals.json
3. Create timestamped backups
4. Generate updated sitemap.xml automatically
5. Validate the data integrity
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
