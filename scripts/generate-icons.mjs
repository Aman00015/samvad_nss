import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
const svgPath = join(iconsDir, 'icon.svg');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

mkdirSync(iconsDir, { recursive: true });

const svgBuffer = readFileSync(svgPath);

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}x${size}.png`));
  console.log(`Generated icon-${size}x${size}.png`);
}

// Also generate the apple-touch-icon and favicon
await sharp(svgBuffer).resize(180, 180).png().toFile(join(__dirname, '..', 'public', 'apple-touch-icon.png'));
console.log('Generated apple-touch-icon.png');

await sharp(svgBuffer).resize(32, 32).png().toFile(join(__dirname, '..', 'public', 'favicon.png'));
console.log('Generated favicon.png');

console.log('All icons generated!');
