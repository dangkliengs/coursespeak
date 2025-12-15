#!/bin/bash

# VPS Deployment and Cache Clear Script for Coursespeak
echo "🚀 VPS Deployment and Cache Management Script"
echo "============================================="

# Function to show menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1. Deploy/Restart Application"
    echo "2. Clear Application Cache"
    echo "3. Clear Nginx Cache"
    echo "4. Full Restart (App + Nginx)"
    echo "5. Check Application Status"
    echo "6. View Logs"
    echo "7. Exit"
    echo ""
}

# Function to restart PM2 application
restart_app() {
    echo "🔄 Restarting application..."
    pm2 restart coursespeak
    if [ $? -eq 0 ]; then
        echo "✅ Application restarted successfully"
    else
        echo "❌ Failed to restart application"
    fi
}

# Function to clear Next.js cache
clear_nextjs_cache() {
    echo "🧹 Clearing Next.js cache..."
    rm -rf .next
    echo "✅ Next.js cache cleared"
}

# Function to rebuild application
rebuild_app() {
    echo "🔨 Rebuilding application..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Application built successfully"
        restart_app
    else
        echo "❌ Build failed"
    fi
}

# Function to clear nginx cache
clear_nginx_cache() {
    echo "🧹 Clearing Nginx cache..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl reload nginx
        echo "✅ Nginx reloaded"
    else
        sudo service nginx reload
        echo "✅ Nginx reloaded"
    fi
}

# Function to full restart
full_restart() {
    echo "🔄 Performing full restart..."
    restart_app
    clear_nginx_cache
    echo "✅ Full restart completed"
}

# Function to check status
check_status() {
    echo "📊 Application Status:"
    pm2 status

    echo ""
    echo "🌐 Nginx Status:"
    if command -v systemctl &> /dev/null; then
        sudo systemctl status nginx --no-pager
    else
        sudo service nginx status
    fi
}

# Function to view logs
view_logs() {
    echo "📋 Recent Application Logs:"
    pm2 logs coursespeak --lines 50 --nostream

    echo ""
    echo "📋 Nginx Error Logs:"
    sudo tail -50 /var/log/nginx/error.log
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-7): " choice

    case $choice in
        1)
            echo "🚀 Deploy/Restart Application"
            restart_app
            ;;
        2)
            echo "🧹 Clear Application Cache"
            clear_nextjs_cache
            rebuild_app
            ;;
        3)
            echo "🧹 Clear Nginx Cache"
            clear_nginx_cache
            ;;
        4)
            echo "🔄 Full Restart"
            full_restart
            ;;
        5)
            echo "📊 Check Status"
            check_status
            ;;
        6)
            echo "📋 View Logs"
            view_logs
            ;;
        7)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-7."
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
done
