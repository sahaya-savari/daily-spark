#!/usr/bin/env node

/**
 * Favicon Generator Script for Daily Spark
 * 
 * This script converts SVG icons to PNG and ICO formats.
 * 
 * Prerequisites:
 * npm install sharp sharp-ico
 * 
 * Usage:
 * node generate-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import toIco from 'sharp-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

const conversions = [
  { input: 'favicon.svg', output: 'favicon-16x16.png', size: 16 },
  { input: 'favicon.svg', output: 'favicon-32x32.png', size: 32 },
  { input: 'apple-touch-icon.svg', output: 'apple-touch-icon.png', size: 180 },
  { input: 'icon-192x192.svg', output: 'icon-192x192.png', size: 192 },
  { input: 'icon-512x512.svg', output: 'icon-512x512.png', size: 512 },
  { input: 'icon-192x192.svg', output: 'icon-maskable-192x192.png', size: 192 },
  { input: 'icon-512x512.svg', output: 'icon-maskable-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('🔥 Generating Daily Spark icons...\n');

  for (const { input, output, size } of conversions) {
    const inputPath = path.join(publicDir, input);
    const outputPath = path.join(publicDir, output);

    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 10, g: 10, b: 10, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${output} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${output}:`, error.message);
    }
  }

  // Generate favicon.ico from 16x16 and 32x32 PNGs
  console.log('\n🔥 Generating favicon.ico...');
  try {
    const sizes = [16, 32];
    const buffers = await Promise.all(
      sizes.map(size => 
        sharp(path.join(publicDir, 'favicon.svg'))
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );
    
    const icoBuffer = toIco.default ? await toIco.default(buffers) : await toIco(buffers);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('✅ Generated favicon.ico (multi-size)');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
    // Fallback: use just 32x32 as ico
    try {
      const buffer = await sharp(path.join(publicDir, 'favicon.svg'))
        .resize(32, 32)
        .toFormat('png')
        .toBuffer();
      fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buffer);
      console.log('✅ Generated favicon.ico (32x32 fallback)');
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
    }
  }

  console.log('\n🎉 Icon generation complete!\n');
  console.log('📦 Generated files:');
  console.log('  - favicon.ico');
  console.log('  - favicon-16x16.png');
  console.log('  - favicon-32x32.png');
  console.log('  - apple-touch-icon.png (180x180)');
  console.log('  - icon-192x192.png');
  console.log('  - icon-512x512.png');
  console.log('  - icon-maskable-192x192.png');
  console.log('  - icon-maskable-512x512.png\n');
}

generateIcons().catch(console.error);
