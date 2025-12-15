#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Configuration - adjust these to match your VPS
const VPS_CONFIG = {
  host: process.env.VPS_HOST || "coursespeak.com", // Your VPS domain/IP
  port: process.env.VPS_PORT || 443, // Usually 443 for HTTPS, 80 for HTTP
  protocol: process.env.VPS_PROTOCOL || "https", // http or https
  // Add authentication if needed
  auth: process.env.VPS_AUTH || null // e.g., "username:password"
};

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(process.cwd(), "backup");

// Files to sync from VPS
const FILES_TO_SYNC = [
  // Data files
  "data/deals.json",
  
  // Important app files that might be different
  "app/layout.tsx",
  "app/page.tsx", 
  "app/deal/[id]/page.tsx",
  "app/[slug]/page.tsx",
  "app/not-found.tsx",
  
  // Components
  "components/NewsletterSignupCard.tsx",
  "components/ActionsPanel.tsx",
  "components/RelatedList.tsx",
  
  // Lib files
  "lib/store.ts",
  "lib/links.ts",
  "lib/markdown.ts",
  
  // Config files
  "next.config.js",
  "package.json",
  
  // Styles
  "styles/globals.css"
];

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
    const client = VPS_CONFIG.protocol === 'https' ? https : http;
    
    const requestOptions = {
      hostname: VPS_CONFIG.host,
      port: VPS_CONFIG.port,
      path: url,
      method: 'GET',
      headers: {
        'User-Agent': 'coursespeak-sync/1.0',
        ...options.headers
      }
    };

    // Add authentication if provided
    if (VPS_CONFIG.auth) {
      const auth = Buffer.from(VPS_CONFIG.auth).toString('base64');
      requestOptions.headers['Authorization'] = `Basic ${auth}`;
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
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

    req.end();
  });
}

async function backupLocalFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.join(BACKUP_DIR, `${filePath.replace(/[\/\\]/g, '_')}_backup_${timestamp}`);
      
      await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.promises.copyFile(fullPath, backupPath);
      
      console.log(`📦 Backed up: ${filePath} → ${backupPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`⚠️ Could not backup ${filePath}:`, error.message);
    return false;
  }
}

async function syncFileFromVPS(filePath) {
  try {
    console.log(`🔄 Syncing: ${filePath}`);
    
    // Backup existing file
    await backupLocalFile(filePath);
    
    // Fetch from VPS
    const url = `/${filePath}`;
    const content = await fetchWithRetry(url);
    
    // Write to local
    const fullPath = path.join(process.cwd(), filePath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, content, 'utf-8');
    
    console.log(`✅ Synced: ${filePath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to sync ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting sync from VPS...\n');
  
  console.log(`🔗 VPS Configuration:`);
  console.log(`   Host: ${VPS_CONFIG.protocol}://${VPS_CONFIG.host}:${VPS_CONFIG.port}`);
  console.log(`   Auth: ${VPS_CONFIG.auth ? 'Yes' : 'No'}`);
  console.log('');

  // Test connection
  try {
    console.log('🔍 Testing connection to VPS...');
    await fetchWithRetry('/package.json'); // Test with a simple file
    console.log('✅ Connection successful!\n');
  } catch (error) {
    console.error('❌ Failed to connect to VPS:', error.message);
    console.log('\n💡 Please check:');
    console.log('   - VPS is running and accessible');
    console.log('   - Host/IP address is correct');
    console.log('   - Port is open (443 for HTTPS, 80 for HTTP)');
    console.log('   - Authentication credentials are correct');
    process.exit(1);
  }

  // Create backup directory
  await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
  
  let successCount = 0;
  let failCount = 0;
  
  // Sync each file
  for (const filePath of FILES_TO_SYNC) {
    const success = await syncFileFromVPS(filePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n📈 Sync Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📊 Total: ${FILES_TO_SYNC.length}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All files synced successfully!');
    console.log('💡 Run "npm run dev" to start development with synced files.');
  } else {
    console.log('\n⚠️ Some files failed to sync. Check the errors above.');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 VPS Sync Script

Usage: node scripts/sync-from-vps.js [options]

Options:
  --host HOST       VPS hostname or IP (default: coursespeak.com)
  --port PORT       VPS port (default: 443 for HTTPS)
  --protocol http|https  Protocol (default: https)
  --auth USER:PASS  Basic authentication (optional)
  --help, -h        Show this help

Environment Variables:
  VPS_HOST          VPS hostname or IP
  VPS_PORT          VPS port
  VPS_PROTOCOL      Protocol (http/https)
  VPS_AUTH          Basic authentication

Examples:
  node scripts/sync-from-vps.js
  node scripts/sync-from-vps.js --host my-vps.com --port 8080
  node scripts/sync-from-vps.js --auth admin:password

The script will:
1. Test connection to your VPS
2. Backup existing local files
3. Download important files from VPS
4. Replace local files with VPS versions
`);
  process.exit(0);
}

// Parse command line arguments
const hostArg = args.find((arg, index) => arg === '--host' && args[index + 1]);
if (hostArg) {
  VPS_CONFIG.host = args[args.indexOf('--host') + 1];
}

const portArg = args.find((arg, index) => arg === '--port' && args[index + 1]);
if (portArg) {
  VPS_CONFIG.port = parseInt(args[args.indexOf('--port') + 1]);
}

const protocolArg = args.find((arg, index) => arg === '--protocol' && args[index + 1]);
if (protocolArg) {
  VPS_CONFIG.protocol = args[args.indexOf('--protocol') + 1];
}

const authArg = args.find((arg, index) => arg === '--auth' && args[index + 1]);
if (authArg) {
  VPS_CONFIG.auth = args[args.indexOf('--auth') + 1];
}

main();
