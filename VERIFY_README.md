# 🔍 Verify Backup: Compare Local vs Live Site

This script compares your local deals data with the live coursespeak.com site to verify the backup was successful.

## 🚀 Quick Start

```bash
# Verify backup matches live site
npm run verify

# Or run directly
node scripts/verify-backup.js

# Compare with custom URL
node scripts/verify-backup.js --url https://staging.coursespeak.com
```

## 📊 What It Checks

1. **Deal Counts**: Total number of deals on both sites
2. **Provider Distribution**: Top 5 providers and their counts
3. **Category Distribution**: Top 5 categories and their counts
4. **Pricing Analysis**: Free vs paid deals percentage
5. **Sample Deals**: Shows actual deal titles and URLs

## 📈 Sample Output

```
🔍 Verifying backup: Comparing local vs live site deals...

📂 Analyzing local data: data/deals.json
  📊 Local: 854 deals

🔍 Analyzing live site: https://coursespeak.com
  📊 Live site: 854 deals across 18 pages

📊 COMPARISON RESULTS:
   ════════════════════════════════════════

📈 DEAL COUNTS:
   Live site:  854 deals
   Local:      854 deals
   Difference: 0 deals ✅

🏢 TOP PROVIDERS:
   Live Site → Local
   ──────────────────
   udemy        (650) → udemy        (650) ✅
   coursera     (120) → coursera     (120) ✅
   pluralsight  (45)  → pluralsight  (45)  ✅
   skillshare   (25)  → skillshare   (25)  ✅
   linkedin     (14)  → linkedin     (14)  ✅

📂 TOP CATEGORIES:
   Live Site → Local
   ──────────────────
   development          (200) → development          (200) ✅
   data science         (150) → data science         (150) ✅
   design               (120) → design               (120) ✅
   it & software        (100) → it & software        (100) ✅
   marketing            (80)  → marketing            (80)  ✅

💰 PRICING:
   Live site: 680/854 free deals (79.6%)
   Local:     680/854 free deals (79.6%)
   Free deals match: ✅

🏁 OVERALL STATUS:
   🎉 BACKUP SUCCESSFUL! Local data matches live site.

🔍 CHECKING SPECIFIC DEALS:
   📝 "Spring Boot Microservices Professional eCommerce M..."
      URL: https://trk.udemy.com/DyoaEj
   📝 "Spring Security 6 with ReactJS, OAuth2, JWT | Spri..."
      URL: https://trk.udemy.com/4G9M1M
   ✅ Found 5 sample deals in local data

💡 Tips:
   • If counts match: Backup was successful ✅
   • If providers match: Data integrity is good ✅
   • If categories match: Filtering will work correctly ✅
   • Run "npm run dev" to test the local site with new data
```

## ✅ Verification Results

When the verification shows **all green checkmarks (✅)**, it means:

- ✅ **Deal counts match**: Same number of deals
- ✅ **Providers match**: Same distribution of providers
- ✅ **Categories match**: Same distribution of categories
- ✅ **Pricing matches**: Same percentage of free deals
- ✅ **Sample deals exist**: Actual deals are present and valid

## 🔧 Troubleshooting

### ❌ Counts Don't Match
- The backup might have been interrupted
- Run the backup again: `npm run backup`

### ❌ Categories/Providers Different
- The live site data might have changed since backup
- Re-run backup to get latest data: `npm run backup`

### ❌ Connection Errors
- Check your internet connection
- Verify the live site URL is accessible
- Try with a different URL if using staging

## 🎯 Integration with Backup

```bash
# Complete workflow:
npm run backup    # Fetch from live site
npm run verify    # Confirm backup worked
npm run dev       # Test with new data
```

## 📋 Manual Verification

You can also manually check:

1. **File sizes**: Compare `data/deals.json` size with backup files
2. **Deal counts**: Check number of lines in JSON files
3. **Recent deals**: Look for recent dates in the data
4. **Categories**: Search for specific categories you know exist

## 🆘 Need Help?

If verification fails:
1. Check error messages in the console
2. Re-run the backup script
3. Verify your internet connection
4. Check if the live site API has changed
