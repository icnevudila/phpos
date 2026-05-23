import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const keys = [
  'ALLOW_PUBLIC_REGISTER', 'API_PREFIX', 'CORS_ORIGIN', 'DATABASE_URL',
  'DIRECT_URL', 'JWT_ACCESS_EXPIRES', 'JWT_ACCESS_SECRET',
  'JWT_REFRESH_EXPIRES', 'JWT_REFRESH_SECRET', 'NODE_ENV',
  'PORT', 'STORAGE_DRIVER', 'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET', 'SUPABASE_URL'
];

console.log('Removing old corrupted env vars...');
for (const key of keys) {
  try {
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Failed to rm ${key}, might not exist`);
  }
}

console.log('Reading .env file...');
const envFile = readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');

for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    
    // Add Vercel frontend URL to CORS_ORIGIN
    if (key === 'CORS_ORIGIN') {
      val = "http://localhost:5173,https://frontend-rho-ruby-69.vercel.app,https://frontend-rntsjtxuf-alis-projects-a7c43f3e.vercel.app";
    }

    console.log(`Adding ${key}...`);
    // Pass the value directly as an argument, which avoids interactive prompts in newer Vercel CLI!
    // Wait, `vercel env add` does not accept value as argument. We must pipe it.
    // In Node.js, we can spawn and write to stdin cleanly.
    const { spawnSync } = require('child_process');
    const child = spawnSync('npx.cmd', ['vercel', 'env', 'add', key, 'production'], {
      input: val,
      encoding: 'utf-8'
    });
    console.log(child.stdout);
    console.error(child.stderr);
  }
}
console.log('Done!');
