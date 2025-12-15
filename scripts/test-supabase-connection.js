#!/usr/bin/env node

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { createClient } = require("@supabase/supabase-js");

async function testConnection() {
  console.log("🔍 Testing Supabase connection...");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                     process.env.SUPABASE_SERVICE_KEY || 
                     process.env.SUPABASE_SERVICE_ROLE ||
                     process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing configuration");
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log("📡 Testing connection...");
    
    // Test basic connection
    const { data, error } = await supabase.from('deals').select('count').limit(1);
    
    if (error) {
      console.error("❌ Supabase error:", error);
    } else {
      console.log("✅ Connection successful!");
      
      // Get actual count
      const { count, error: countError } = await supabase.from('deals').select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("❌ Count error:", countError);
      } else {
        console.log(`📊 Total deals in database: ${count}`);
      }
    }

  } catch (error) {
    console.error("❌ Connection error:", error.message);
  }
}

testConnection();
