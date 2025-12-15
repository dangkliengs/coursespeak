#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function aggressiveCleanup() {
  console.log('🧹 AGGRESSIVE BACKUP CLEANUP\n');

  let removedCount = 0;
  let totalSpaceSaved = 0;

  // Clean data folder - remove all backup files except the active one
  const dataDir = path.join(process.cwd(), "data");
  try {
    const files = fs.readdirSync(dataDir);
    console.log(`📁 Cleaning data folder...`);

    files.forEach(file => {
      if (file.includes('deals') && file !== 'deals.json' && (file.includes('backup') || file.includes('sample'))) {
        const filePath = path.join(dataDir, file);
        const stats = fs.statSync(filePath);
        const ageDays = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`   🗑️  Removing: ${file} (${ageDays} days old, ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        fs.unlinkSync(filePath);
        removedCount++;
        totalSpaceSaved += stats.size;
      }
    });
  } catch (error) {
    console.log(`❌ Error cleaning data folder:`, error.message);
  }

  // Clean backup folder - keep only essential files
  const backupDir = path.join(process.cwd(), "backup");
  try {
    const files = fs.readdirSync(backupDir);
    console.log(`\n📦 Cleaning backup folder...`);

    const keepPatterns = [
      'deals_current.json',  // Current backup
      /^deals_backup_2025-10-26T\d{2}-\d{2}-\d{2}\.json$/, // Today's backups only
      /^deals_local_2025-10-26T\d{2}-\d{2}-\d{2}/ // Today's local backups only
    ];

    files.forEach(file => {
      if (file.includes('deals') && file.endsWith('.json')) {
        const shouldKeep = keepPatterns.some(pattern => {
          if (typeof pattern === 'string') {
            return file === pattern;
          } else {
            return pattern.test(file);
          }
        });

        if (!shouldKeep) {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          const ageDays = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));

          console.log(`   🗑️  Removing: ${file} (${ageDays} days old, ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

          fs.unlinkSync(filePath);
          removedCount++;
          totalSpaceSaved += stats.size;
        }
      }
    });
  } catch (error) {
    console.log(`❌ Error cleaning backup folder:`, error.message);
  }

  const spaceSavedMB = (totalSpaceSaved / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Aggressive cleanup completed!`);
  console.log(`📊 Files removed: ${removedCount}`);
  console.log(`💾 Space saved: ${spaceSavedMB} MB`);

  console.log(`\n📋 Remaining essential files:`);
  console.log(`   - data/deals.json (active file)`);
  console.log(`   - backup/deals_current.json (current backup)`);
  console.log(`   - backup/deals_backup_2025-10-26*.json (today's backups)`);
  console.log(`   - backup/deals_local_2025-10-26*.json (live site backups)`);
}

aggressiveCleanup();
