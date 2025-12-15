#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function analyzeFiles(files, folderName) {
  console.log(`📁 ${folderName} folder:`);
  console.log(`   ══════════════════════════════════════`);

  const dealFiles = files.filter(file => file.includes('deals') && (file.endsWith('.json') || file.endsWith('.backup')));

  if (dealFiles.length === 0) {
    console.log(`   No deal backup files found`);
    return [];
  }

  const fileInfo = dealFiles.map(file => {
    const filePath = path.join(folderName === 'data' ? process.cwd() + '/data' : process.cwd() + '/backup', file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      path: filePath,
      size: stats.size,
      modified: stats.mtime,
      isActive: file === 'deals.json',
      isCurrent: file === 'deals_current.json',
      isLocal: file.includes('local')
    };
  });

  // Sort by modification date (newest first)
  fileInfo.sort((a, b) => b.modified.getTime() - a.modified.getTime());

  fileInfo.forEach((file, index) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const status = file.isActive ? '🎯 ACTIVE' : file.isCurrent ? '📋 CURRENT' : file.isLocal ? '🔄 LOCAL BACKUP' : '📦 BACKUP';
    const age = Math.floor((Date.now() - file.modified.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`   ${index + 1}. ${status} ${file.name}`);
    console.log(`      📏 Size: ${sizeMB} MB`);
    console.log(`      📅 Modified: ${file.modified.toISOString().split('T')[0]} (${age} days ago)`);
    console.log(`      📄 Path: ${file.path}`);
    console.log('');
  });

  return fileInfo;
}

function cleanupOldBackups(dataInfo, backupInfo) {
  console.log(`🧹 CLEANUP RECOMMENDATIONS:\n`);

  const filesToKeepInData = [];
  const filesToRemoveInData = [];

  if (dataInfo.length > 0) {
    console.log(`📁 Data folder cleanup:`);

    // Always keep the active file
    const activeFile = dataInfo.find(f => f.isActive);
    if (activeFile) {
      filesToKeepInData.push(activeFile);
      console.log(`   ✅ KEEP: ${activeFile.name} (active file)`);
    }

    // Keep only 1 recent backup (remove old ones)
    const backupFiles = dataInfo.filter(f => !f.isActive);
    const recentBackups = backupFiles.filter(f => {
      const ageDays = Math.floor((Date.now() - f.modified.getTime()) / (1000 * 60 * 60 * 24));
      return ageDays <= 1; // Keep only backups from last 1 day
    });

    if (recentBackups.length > 0) {
      const mostRecent = recentBackups[0];
      filesToKeepInData.push(mostRecent);
      console.log(`   ✅ KEEP: ${mostRecent.name} (recent backup - ${Math.floor((Date.now() - mostRecent.modified.getTime()) / (1000 * 60 * 60 * 24))} days old)`);
    }

    // Remove ALL old backups (more aggressive cleanup)
    const oldFiles = dataInfo.filter(f =>
      !filesToKeepInData.includes(f) &&
      f.name.includes('backup')
    );

    oldFiles.forEach(file => {
      filesToRemoveInData.push(file);
      const ageDays = Math.floor((Date.now() - file.modified.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   ❌ REMOVE: ${file.name} (old backup - ${ageDays} days old)`);
    });

    console.log('');
  }

  // For backup folder: keep current, recent backups, and live site backups
  const filesToKeepInBackup = [];
  const filesToRemoveInBackup = [];

  if (backupInfo.length > 0) {
    console.log(`📦 Backup folder cleanup:`);

    // Always keep current backup
    const currentFile = backupInfo.find(f => f.isCurrent);
    if (currentFile) {
      filesToKeepInBackup.push(currentFile);
      console.log(`   ✅ KEEP: ${currentFile.name} (current backup)`);
    }

    // Keep only 1 most recent timestamped backup (remove older ones)
    const timestampedFiles = backupInfo.filter(f =>
      !f.isCurrent &&
      f.name.includes('deals_backup_')
    );

    if (timestampedFiles.length > 0) {
      const mostRecent = timestampedFiles[0];
      filesToKeepInBackup.push(mostRecent);
      console.log(`   ✅ KEEP: ${mostRecent.name} (most recent backup)`);
    }

    // Keep live site backups (they're different from local backups)
    const liveSiteBackups = backupInfo.filter(f => f.isLocal);
    liveSiteBackups.forEach(file => {
      filesToKeepInBackup.push(file);
      console.log(`   ✅ KEEP: ${file.name} (live site backup)`);
    });

    // Remove old files and duplicates
    const filesToRemove = [];

    // First, check for duplicates by comparing file contents
    const fileHashes = new Map();
    const duplicates = [];

    backupInfo.forEach(file => {
      try {
        const fileContent = fs.readFileSync(file.path, 'utf-8');
        const fileHash = require('crypto').createHash('md5').update(fileContent).digest('hex');

        if (fileHashes.has(fileHash)) {
          // This is a duplicate
          if (!duplicates.includes(file)) {
            duplicates.push(file);
            console.log(`   ❌ DUPLICATE: ${file.name} (identical to ${fileHashes.get(fileHash).name})`);
          }
        } else {
          fileHashes.set(fileHash, file);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not read ${file.name} for duplicate check`);
      }
    });

    // Add duplicates to removal list
    duplicates.forEach(file => {
      if (!filesToKeepInBackup.includes(file)) {
        filesToRemove.push(file);
      }
    });

    // Add old files to removal list
    const oldFiles = backupInfo.filter(f => {
      const ageDays = Math.floor((Date.now() - f.modified.getTime()) / (1000 * 60 * 60 * 24));
      const isTooOld = ageDays > 1; // Remove files older than 1 day
      const isNotEssential = !filesToKeepInBackup.includes(f);

      return isTooOld && isNotEssential && !duplicates.includes(f);
    });

    oldFiles.forEach(file => {
      if (!filesToRemove.includes(file)) {
        filesToRemove.push(file);
        const ageDays = Math.floor((Date.now() - file.modified.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ❌ REMOVE: ${file.name} (old backup - ${Math.floor(ageDays)} days old)`);
      }
    });

    console.log('');
  }

  return {
    data: { keep: filesToKeepInData, remove: filesToRemoveInData },
    backup: { keep: filesToKeepInBackup, remove: filesToRemoveInBackup }
  };
}

async function performCleanup(decisions) {
  console.log(`🔄 PERFORMING CLEANUP...\n`);

  let removedCount = 0;
  let totalSpaceSaved = 0;

  // Cleanup data folder
  if (decisions.data.remove.length > 0) {
    console.log(`📁 Cleaning data folder:`);
    for (const file of decisions.data.remove) {
      try {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        fs.unlinkSync(file.path);
        removedCount++;
        totalSpaceSaved += file.size;
        console.log(`   ✅ Removed: ${file.name} (${sizeMB} MB)`);
      } catch (error) {
        console.log(`   ❌ Failed to remove ${file.name}:`, error.message);
      }
    }
    console.log('');
  }

  // Cleanup backup folder
  if (decisions.backup.remove.length > 0) {
    console.log(`📦 Cleaning backup folder:`);
    for (const file of decisions.backup.remove) {
      try {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        fs.unlinkSync(file.path);
        removedCount++;
        totalSpaceSaved += file.size;
        console.log(`   ✅ Removed: ${file.name} (${sizeMB} MB)`);
      } catch (error) {
        console.log(`   ❌ Failed to remove ${file.name}:`, error.message);
      }
    }
    console.log('');
  }

  const spaceSavedMB = (totalSpaceSaved / 1024 / 1024).toFixed(2);
  console.log(`✅ Cleanup completed!`);
  console.log(`📊 Files removed: ${removedCount}`);
  console.log(`💾 Space saved: ${spaceSavedMB} MB`);
  console.log('');
  console.log(`📋 Remaining files:`);
  console.log(`   - Active file: data/deals.json`);
  console.log(`   - Current backup: backup/deals_current.json`);
  console.log(`   - Recent backups: 2-3 timestamped files`);
  console.log(`   - Live site backups: Local backup files`);
}

async function main() {
  console.log('🧹 BACKUP CLEANUP ANALYZER\n');

  try {
    // Analyze data folder
    const dataDir = path.join(process.cwd(), "data");
    const dataFiles = fs.readdirSync(dataDir);
    const dataInfo = analyzeFiles(dataFiles, 'data');

    // Analyze backup folder
    const backupDir = path.join(process.cwd(), "backup");
    const backupFiles = fs.readdirSync(backupDir);
    const backupInfo = analyzeFiles(backupFiles, 'backup');

    // Get cleanup recommendations
    const decisions = cleanupOldBackups(dataInfo, backupInfo);

    console.log(`📊 CLEANUP SUMMARY:`);
    console.log(`   Data folder: Keep ${decisions.data.keep.length}, Remove ${decisions.data.remove.length}`);
    console.log(`   Backup folder: Keep ${decisions.backup.keep.length}, Remove ${decisions.backup.remove.length}`);
    console.log('');

    // Perform cleanup if confirmed
    const args = process.argv.slice(2);
    if (args.includes('--confirm')) {
      await performCleanup(decisions);
    } else {
      console.log(`⚠️  WARNING: This will permanently delete old backup files!`);
      console.log(`   Make sure you have verified the current data is correct first.`);
      console.log(`   The active deals.json file will NOT be touched.`);
      console.log('');
      console.log(`💡 To proceed with cleanup, run:`);
      console.log(`   npm run cleanup -- --confirm`);
      console.log('');
      console.log(`🔍 To verify data first:`);
      console.log(`   npm run verify  # Check if local matches live site`);
    }

  } catch (error) {
    console.error('❌ Error analyzing backup files:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments at top level
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧹 Backup Cleanup Script

Usage: node scripts/cleanup-backups.js [options]

Options:
  --confirm     Actually perform the cleanup (destructive!)
  --help, -h    Show this help

This script will:
1. Analyze all backup files in data/ and backup/ folders
2. Show which files are active vs old backups
3. Recommend which old backups to remove
4. Only remove files when --confirm is used

Examples:
  npm run cleanup           # Show analysis only
  npm run cleanup -- --confirm  # Actually cleanup
`);
  process.exit(0);
}

main();
