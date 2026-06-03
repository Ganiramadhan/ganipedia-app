#!/usr/bin/env node

/**
 * Image Validation Script
 * Validates that portfolio and review images exist in the public folder
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the data file
const dataPath = join(__dirname, '../src/data/index.ts');
const publicPath = join(__dirname, '../public');

console.log('🔍 Validating portfolio and review images...\n');

try {
  const dataContent = readFileSync(dataPath, 'utf-8');
  
  // Extract public image paths used by portfolio cards and testimonials.
  const imageRegex = /['"]\/(?:projects|reviews)\/[^'"]+\.(?:png|jpg|jpeg|gif|webp)['"]/g;
  const matches = dataContent.match(imageRegex);
  
  if (!matches) {
    console.log('❌ No image paths found in data file');
    process.exit(1);
  }
  
  const imagePaths = [...new Set(matches.map(m => m.replace(/['"]/g, '')))];
  
  console.log(`Found ${imagePaths.length} unique image references:\n`);
  
  let missingCount = 0;
  let foundCount = 0;
  
  imagePaths.forEach(imagePath => {
    const fullPath = join(publicPath, imagePath);
    const exists = existsSync(fullPath);
    
    if (exists) {
      console.log(`✅ ${imagePath}`);
      foundCount++;
    } else {
      console.log(`❌ ${imagePath} - NOT FOUND`);
      missingCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Found: ${foundCount}`);
  console.log(`   Missing: ${missingCount}`);
  
  if (missingCount > 0) {
    console.log(`\n⚠️  Warning: ${missingCount} images are missing!`);
    console.log('Please add the missing images to the public/projects/ folder.');
    process.exit(1);
  } else {
    console.log('\n✨ All images are present!');
    process.exit(0);
  }
  
} catch (error) {
  console.error('❌ Error reading data file:', error.message);
  process.exit(1);
}
