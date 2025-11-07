#!/usr/bin/env node
/**
 * Asset organization script
 * Organizes PNG assets into categories: buildings, characters, items, tiles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../frontend/public/images');

// Category definitions based on filename patterns
const categories = {
  buildings: [
    'bank', 'factory', 'employment', 'hitech', 'lowcost', 'rent',
    'zmart', 'clothing', 'pawn', 'clock', 'socket'
  ],
  characters: [
    'black_bot', 'black_right', 'black_top', 'monolith'
  ],
  items: [
    'security'
  ],
  tiles: [
    'jones_map', 'grass', 'wall', 'test'
  ]
};

function categorizeFile(filename) {
  const lower = filename.toLowerCase();

  // Check each category
  for (const [category, patterns] of Object.entries(categories)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        return category;
      }
    }
  }

  // Default to tiles for unmatched files
  return 'tiles';
}

function organizeAssets() {
  console.log('Organizing assets...\n');

  // Get all PNG files in the source directory
  const files = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.png') && fs.statSync(path.join(sourceDir, f)).isFile());

  const stats = {
    buildings: 0,
    characters: 0,
    items: 0,
    tiles: 0
  };

  // Move files to appropriate subdirectories
  for (const file of files) {
    const category = categorizeFile(file);
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(sourceDir, category, file);

    // Move the file
    fs.renameSync(sourcePath, targetPath);
    stats[category]++;

    console.log(`  ${file} -> ${category}/`);
  }

  console.log('\n✅ Asset organization complete!\n');
  console.log('Statistics:');
  console.log(`  Buildings: ${stats.buildings} files`);
  console.log(`  Characters: ${stats.characters} files`);
  console.log(`  Items: ${stats.items} files`);
  console.log(`  Tiles: ${stats.tiles} files`);
  console.log(`  Total: ${files.length} files`);
}

// Run the organization
try {
  organizeAssets();
} catch (error) {
  console.error('Error organizing assets:', error);
  process.exit(1);
}
