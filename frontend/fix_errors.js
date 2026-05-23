import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Revert createElement("a", { defaultValue: "A" }) -> createElement("a")
  content = content.replace(/createElement\("a", \{ defaultValue: "[^"]+" \}\)/g, 'createElement("a")');
  content = content.replace(/createElement\('a', \{ defaultValue: "[^"]+" \}\)/g, "createElement('a')");

  // Revert split(".", { defaultValue: " " }) -> split(".")
  // Actually, any split with defaultValue
  content = content.replace(/split\((['"])([\w\.]*)\1, \{ defaultValue: "[^"]*" \}\)/g, 'split($1$2$1)');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

walkDir(path.join(__dirname, 'src'));
console.log("Done fixing createElement and split.");
