import fs from 'fs';
import path from 'path';

const distAssetsPath = path.resolve('dist', 'assets');

if (!fs.existsSync(distAssetsPath)) {
  console.error('dist/assets not found. Run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(distAssetsPath);
const jsFiles = files.filter((file) => file.endsWith('.js'));

const defaultSizeLimitKb = 500;
const chunkOverrides = [
  {
    pattern: /^HeicToJpg-.*\.js$/,
    sizeLimitKb: 1500,
    reason: 'HEIC decoding dependency is large but loaded lazily only when this tool is opened.'
  }
];

const getLimit = (file) => {
  const match = chunkOverrides.find((override) => override.pattern.test(file));
  return match ? match.sizeLimitKb : defaultSizeLimitKb;
};

const oversized = jsFiles
  .map((file) => {
    const full = path.join(distAssetsPath, file);
    const sizeKb = fs.statSync(full).size / 1024;
    return { file, sizeKb, limitKb: getLimit(file) };
  })
  .filter((entry) => entry.sizeKb > entry.limitKb)
  .sort((a, b) => b.sizeKb - a.sizeKb);

if (oversized.length > 0) {
  console.error(`Bundle budget failed. JS files exceeded configured size limits.`);
  oversized.forEach((entry) => {
    console.error(`- ${entry.file}: ${entry.sizeKb.toFixed(2)}KB (limit: ${entry.limitKb}KB)`);
  });
  process.exit(1);
}

console.log(`Bundle budget passed. ${jsFiles.length} JS assets checked (default <= ${defaultSizeLimitKb}KB, with targeted overrides).`);
