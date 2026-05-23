const https = require('https');

const zoneId = process.env.CLOUDFLARE_ZONE_ID || 'dfcd262799ad2839371eafbf1df230b5';
const email = process.env.CLOUDFLARE_EMAIL || 'lvllc@lvhllc.org';
const apiKey = process.env.CLOUDFLARE_API_KEY ? process.env.CLOUDFLARE_API_KEY.trim() : undefined;

if (!apiKey) {
  console.error('❌ Error: CLOUDFLARE_API_KEY is not defined in the environment.');
  process.exit(1);
}

console.log(`🧹 Purging Cloudflare Cache for Zone: ${zoneId}...`);

const data = JSON.stringify({ purge_everything: true });

// Check if the key is a global key or API token (global keys are shorter, usually hex-like)
const isGlobalKey = apiKey.length === 37 || !apiKey.includes('-') && !apiKey.includes('_');

const headers = {
  'Content-Type': 'application/json',
  'Content-Length': data.length
};

if (isGlobalKey) {
  console.log(`🔑 Using Global API Key authentication with email: ${email}`);
  headers['X-Auth-Email'] = email;
  headers['X-Auth-Key'] = apiKey;
} else {
  console.log(`🔑 Using API Token (Bearer) authentication`);
  headers['Authorization'] = `Bearer ${apiKey}`;
}

const options = {
  hostname: 'api.cloudflare.com',
  port: 443,
  path: `/client/v4/zones/${zoneId}/purge_cache`,
  method: 'POST',
  headers: headers
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      if (response.success) {
        console.log('✅ Cloudflare Cache Purged Successfully!');
        if (response.result && response.result.id) {
          console.log(`Result ID: ${response.result.id}`);
        }
      } else {
        console.error('❌ Cloudflare Cache Purge Failed:', JSON.stringify(response.errors));
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse Cloudflare API response:', e.message);
      console.error('Raw response:', body);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error making request to Cloudflare:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
