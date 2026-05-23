const { execSync, spawnSync } = require('child_process');
const { readFileSync } = require('fs');

console.log('Reading .env file...');
const envFile = readFileSync('.env', 'utf-8');
const lines = envFile.split(/\r?\n/);

for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    
    if (key === 'CORS_ORIGIN') {
      val = "http://localhost:5173,https://frontend-rho-ruby-69.vercel.app,https://frontend-rntsjtxuf-alis-projects-a7c43f3e.vercel.app";
    }

    console.log(`Adding ${key}...`);
    // npx vercel env add is interactive, we need to pass value via stdin.
    const child = spawnSync('cmd.exe', ['/c', 'npx', 'vercel', 'env', 'add', key, 'production'], {
      input: val,
      encoding: 'utf-8'
    });
    console.log("stdout:", child.stdout);
    console.log("stderr:", child.stderr);
  }
}
console.log('Done!');
