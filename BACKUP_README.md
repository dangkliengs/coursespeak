# 🔄 Backup Deals from Live Site

This script backs up deals **FROM the live coursespeak.com site TO your local project**.

> **Note**: This is different from `scripts/auto_backup.sh` which backs up your local `data/deals.json` file.

## 🚀 Quick Start

```bash
# Backup from live site to local project
npm run backup

# Or run directly
node scripts/backup-from-live.js

# Backup from custom URL
node scripts/backup-from-live.js --url https://your-live-site.com
```

## 🔄 Two Backup Scripts Explained

### 📥 **This Script** (`backup-from-live.js`)
- **Purpose**: Fetch deals FROM live site TO local project
- **Source**: https://coursespeak.com (or custom URL)
- **Destination**: `data/deals.json` (overwrites local data)
- **Use case**: Update local project with fresh deals from live site

### 📤 **Auto Backup** (`auto_backup.sh`)
- **Purpose**: Backup local data TO git/version control
- **Source**: `data/deals.json` (your local data)
- **Destination**: `backup/deals_TIMESTAMP.json` + git commit
- **Use case**: Version control and backup of your work

## 📋 What This Script Does

1. **Fetches all deals** from the live site API
2. **Handles pagination** to get all deals (not just the first page)
3. **Validates data** to ensure integrity
4. **Saves to local** `data/deals.json` (replaces old data)
5. **Creates backups** with timestamps
6. **Shows summary** of providers and categories

## 📁 Files Created

- `data/deals.json` - **REPLACES** your current deals with live data
- `backup/deals_backup_YYYYMMDD_HHMMSS.json` - Timestamped backup
- `backup/deals_current.json` - Current backup (overwritten each time)

## ⚠️ Important: This Replaces Your Local Data!

**Before running:**
```bash
# Backup your current local data first
cp data/deals.json backup/deals_local_backup.json
```

**After running:**
- Your local `data/deals.json` will have the same deals as the live site
- All your local changes will be overwritten
- The live site's deals will be available in your local project

## ⚙️ Configuration

Set environment variables if needed:

```bash
# Custom live site URL
LIVE_SITE_URL=https://your-live-site.com npm run backup

# Custom local data path
DEALS_PATH=/path/to/deals.json npm run backup
```

## 🔍 Troubleshooting

### No deals found?
- Check if the live site URL is correct
- Verify the API endpoint exists
- Check if the site requires authentication

### Permission errors?
- Ensure you have write access to the `data/` directory
- The script creates directories automatically

### Network errors?
- Check your internet connection
- Try with a different URL if using staging

## 📊 Example Output

```
🚀 Starting backup from coursespeak.com...

🔍 Trying to fetch from live site...
📄 Fetching page 1...
  ✅ Page 1: 50 deals (50 total)
📄 Fetching page 2...
  ✅ Page 2: 50 deals (100 total)
📄 Fetching page 3...
  ✅ Page 3: 25 deals (125 total)

📊 Validation: 125 valid, 0 invalid deals

💾 Saved 125 deals to: data/deals.json
📦 Backup created: backup/deals_backup_20241226_143022.json
📋 Current backup: backup/deals_current.json

📈 Backup Summary:
   📊 Total deals: 125
   🏢 Top providers:
      udemy: 85
      coursera: 25
      other: 15
   📂 Top categories:
      development: 35
      data science: 28
      design: 22
      it & software: 20
      marketing: 20

✅ Backup completed successfully!
💡 Run "npm run dev" to see the updated deals in your local project.
```

## 🔄 After Backup

1. Run `npm run dev` to start your local development server
2. The deals will be loaded from `data/deals.json`
3. All filtering and search functionality will work with the real data
4. Category pages will show the actual deals from the live site

## ⚠️ Important Notes

- **Backup your current data** before running if you have local changes
- **API compatibility** - The script assumes the live site has a similar API structure
- **Rate limiting** - The script includes delays to be respectful to the server
- **Data format** - The script validates that deals have required fields (id, title, url)

## 🆘 Need Help?

If the backup fails:
1. Check the error messages in the console
2. Verify the live site URL is accessible
3. Try with `--help` flag for more options
4. Check if the API endpoints have changed on the live site
