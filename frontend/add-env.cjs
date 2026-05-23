const { spawn } = require('child_process');
const cp = spawn('npx', ['vercel', 'env', 'add', 'VITE_API_URL', 'production']);
cp.stdin.write('https://backend-r62m9w57x-alis-projects-a7c43f3e.vercel.app/api');
cp.stdin.end();
cp.stdout.pipe(process.stdout);
cp.stderr.pipe(process.stderr);
