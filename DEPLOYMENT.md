# CourseSpeak - VPS Deployment Commands

## VPS Deployment (Manual Commands)

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/yourusername/coursespeak.git
cd coursespeak

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
nano .env.local  # Edit with your values
```

### 3. Environment Configuration (.env.local)
```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Authentication
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Build and Start Application
```bash
# Build application
npm run build

# Start with PM2
pm2 start npm --name "coursespeak" -- start

# Save PM2 configuration
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 5. Nginx Configuration
```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Create site configuration
sudo nano /etc/nginx/sites-available/coursespeak
```

Add this to `/etc/nginx/sites-available/coursespeak`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Enable and Restart Services
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/coursespeak /etc/nginx/sites-enabled/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Setup (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer

# Update site config for HTTPS
sudo nano /etc/nginx/sites-available/coursespeak
# Change listen 80 to listen 443 ssl
# Add SSL certificate paths
```

### 8. Firewall Setup
```bash
# Enable firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

## Useful Commands

### Application Management
```bash
# PM2 commands
pm2 status                    # Check status
pm2 logs coursespeak          # View logs
pm2 restart coursespeak       # Restart app
pm2 stop coursespeak          # Stop app
pm2 delete coursespeak        # Delete app
pm2 monit                     # Monitor resources
```

### Nginx Management
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test config
sudo tail -f /var/log/nginx/error.log  # View logs
```

### System Monitoring
```bash
htop                          # System resources
df -h                         # Disk usage
free -h                       # Memory usage
sudo ufw status               # Firewall status
```

### Logs and Troubleshooting
```bash
# Application logs
pm2 logs coursespeak --lines 50

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## Domain and DNS Setup
1. Point domain A record to VPS IP
2. Set up www CNAME to domain
3. Wait for DNS propagation

## Post-Deployment
1. Test: `http://your-server-ip`
2. Admin: `http://your-server-ip/admin`
3. Check PM2: `pm2 status`
4. Check Nginx: `sudo systemctl status nginx`

## Backup Commands
```bash
# Manual backup
cp data/deals.json data/deals_backup_$(date +%Y%m%d_%H%M%S).json
cp .env.local .env_backup_$(date +%Y%m%d_%H%M%S)
```
