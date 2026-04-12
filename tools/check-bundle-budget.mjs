import fs from 'fs';
import path from 'path';

const distAssetsPath = path.resolve('dist', 'assets');

if (!fs.existsSync(distAssetsPath)) {
  console.error('dist/assets not found. Run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(distAssetsPath);
const jsFiles = files.filter((file) => file.endsWith('.js'));

const sizeLimitKb = 500;

const oversized = jsFiles
  .map((file) => {
    const full = path.join(distAssetsPath, file);
    const sizeKb = fs.statSync(full).size / 1024;
    return { file, sizeKb };
  })
  .filter((entry) => entry.sizeKb > sizeLimitKb)
  .sort((a, b) => b.sizeKb - a.sizeKb);

if (oversized.length > 0) {
  console.error(`Bundle budget failed. JS files must be <= ${sizeLimitKb}KB.`);
  oversized.forEach((entry) => {
    console.error(`- ${entry.file}: ${entry.sizeKb.toFixed(2)}KB`);
  });
  process.exit(1);
}

console.log(`Bundle budget passed. ${jsFiles.length} JS assets checked (<= ${sizeLimitKb}KB each).`);
