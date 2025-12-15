#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const BACKUP_DIR = path.join(process.cwd(), "backup");
const DATA_DIR = path.join(process.cwd(), "data");
const DEALS_FILE = path.join(DATA_DIR, "deals.json");

// Find the most recent backup file
function findLatestBackup() {
  const files = fs.readdirSync(BACKUP_DIR);
  const backupFiles = files.filter(f => f.startsWith('deals_backup_') && f.endsWith('.json'));

  if (backupFiles.length === 0) {
    throw new Error("No backup files found");
  }

  // Sort by timestamp (newest first)
  backupFiles.sort().reverse();

  return path.join(BACKUP_DIR, backupFiles[0]);
}

async function restoreFromBackup() {
  try {
    const latestBackup = findLatestBackup();
    console.log(`📁 Found latest backup: ${path.basename(latestBackup)}`);

    // Read backup data
    const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf-8'));
    console.log(`📊 Backup contains ${backupData.length} deals`);

    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Write to deals.json
    fs.writeFileSync(DEALS_FILE, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`✅ Restored ${backupData.length} deals to data/deals.json`);

    // Show first few deals to verify
    console.log('\n🔝 First 5 deals in restored data:');
    backupData.slice(0, 5).forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.title} (${deal.provider})`);
      console.log(`   Updated: ${deal.updatedAt || 'No update date'}`);
      console.log(`   Created: ${deal.createdAt || 'No create date'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error restoring from backup:', error.message);
    process.exit(1);
  }
}

restoreFromBackup();