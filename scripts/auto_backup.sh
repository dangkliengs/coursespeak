#!/bin/bash
echo "=== AUTO BACKUP START ==="

cd /var/www/coursespeak

# 1. Backup dengan timestamp
BACKUP_FILE="/var/www/backup/deals_$(date +%Y%m%d_%H%M%S).json"
cp data/deals.json "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# 2. Cek jumlah deals saat ini
DEALS_COUNT=$(grep -c '"id"' data/deals.json)
echo "📊 Current deals: $DEALS_COUNT"

# 3. Cek perubahan git
git add data/deals.json
if git diff --cached --quiet; then
    echo "ℹ️ No changes detected"
    exit 0
fi

# 4. Commit dan push
echo "🔄 Committing changes..."
git commit -m "auto: backup deals $(date +%Y%m%d_%H%M) - $DEALS_COUNT deals"
echo "⬆️ Pushing to GitHub..."
git push origin main

echo "✅ Backup completed at $(date)"
