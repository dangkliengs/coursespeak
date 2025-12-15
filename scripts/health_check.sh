#!/bin/bash
LOG_FILE="/var/log/coursespeak_health.log"

echo "$(date) === HEALTH CHECK ===" >> "$LOG_FILE"

cd /var/www/coursespeak

# Cek deals count
DEALS_COUNT=$(grep -c '"id"' data/deals.json)
echo "Deals count: $DEALS_COUNT" >> "$LOG_FILE"

# Alert jika deals terlalu sedikit
if [ "$DEALS_COUNT" -lt 800 ]; then
    echo "⚠️ WARNING: Only $DEALS_COUNT deals!" >> "$LOG_FILE"
fi

# Cek PM2 status
PM2_STATUS=$(pm2 status coursespeak | grep coursespeak)
echo "PM2 status: $PM2_STATUS" >> "$LOG_FILE"

echo "✅ Health check done" >> "$LOG_FILE"
