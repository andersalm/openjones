#!/usr/bin/env node
/**
 * Asset optimization script
 * - Validates all images exist
 * - Generates manifest.json with dimensions
 * - Reports asset statistics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import imageSize from 'image-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../frontend/public/images');
const manifestPath = path.join(imagesDir, 'manifest.json');

const categories = ['buildings', 'characters', 'items', 'tiles'];

function scanCategory(category) {
  const categoryDir = path.join(imagesDir, category);
  const assets = [];

  if (!fs.existsSync(categoryDir)) {
    console.warn(`Warning: Category directory ${category} does not exist`);
    return assets;
  }

  const files = fs.readdirSync(categoryDir)
    .filter(f => f.endsWith('.png'))
    .sort();

  for (const file of files) {
    const filePath = path.join(categoryDir, file);
    const relativePath = `${category}/${file}`;

    try {
      // Read the file as a buffer first
      const buffer = fs.readFileSync(filePath);
      const dimensions = imageSize(buffer);
      const id = file.replace('.png', '').replace(/_/g, '-');

      assets.push({
        id,
        path: relativePath,
        width: dimensions.width,
        height: dimensions.height,
        filename: file
      });

      console.log(`  ✓ ${relativePath} (${dimensions.width}x${dimensions.height})`);
    } catch (error) {
      console.error(`  ✗ Error reading ${relativePath}:`, error.message);
    }
  }

  return assets;
}

function generateManifest() {
  console.log('🔍 Scanning assets and generating manifest...\n');

  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    assets: {}
  };

  const stats = {
    total: 0
  };

  // Scan each category
  for (const category of categories) {
    console.log(`Scanning ${category}/:`);
    const assets = scanCategory(category);
    manifest.assets[category] = assets;
    stats[category] = assets.length;
    stats.total += assets.length;
    console.log(`  Found ${assets.length} assets\n`);
  }

  // Write manifest to file
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  console.log('✅ Manifest generated successfully!\n');
  console.log('📊 Asset Statistics:');
  console.log(`  Buildings: ${stats.buildings} assets`);
  console.log(`  Characters: ${stats.characters} assets`);
  console.log(`  Items: ${stats.items} assets`);
  console.log(`  Tiles: ${stats.tiles} assets`);
  console.log(`  Total: ${stats.total} assets`);
  console.log(`\n📝 Manifest saved to: ${manifestPath}`);

  return manifest;
}

// Run the optimization
try {
  const manifest = generateManifest();
  process.exit(0);
} catch (error) {
  console.error('❌ Error generating manifest:', error);
  process.exit(1);
}
