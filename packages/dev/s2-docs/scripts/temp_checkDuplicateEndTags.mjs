#!/usr/bin/env node
/**
 * Script to detect duplicate </script></body></html> occurrences in HTML files.
 * This checks for a known bug where the closing tags may appear multiple times.
 * 
 * Usage: node scripts/temp_checkDuplicateEndTags.mjs [directory]
 * Default directory: ./dist
 */

import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {readdir, readFile, stat} from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATTERN = '</script></body></html>';

async function findHtmlFiles(dir) {
  const files = [];
  
  async function walk(currentDir) {
    const entries = await readdir(currentDir);
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await walk(fullPath);
      } else if (entry.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return files;
}

async function checkFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  
  // Count occurrences of the pattern
  const matches = content.match(new RegExp(PATTERN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
  const count = matches ? matches.length : 0;
  
  return {
    filePath,
    count,
    hasDuplicate: count > 1
  };
}

async function main() {
  const targetDir = process.argv[2] || join(__dirname, '..', 'dist');
  
  console.log(`\nChecking for duplicate "${PATTERN}" in HTML files...`);
  console.log(`Directory: ${targetDir}\n`);
  
  let htmlFiles;
  try {
    htmlFiles = await findHtmlFiles(targetDir);
  } catch (error) {
    console.error(`Error reading directory: ${error.message}`);
    process.exit(1);
  }
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found in the specified directory.');
    process.exit(0);
  }
  
  console.log(`Found ${htmlFiles.length} HTML files to check.\n`);
  
  const results = await Promise.all(htmlFiles.map(checkFile));
  const duplicates = results.filter(r => r.hasDuplicate);
  const filesWithPattern = results.filter(r => r.count >= 1);
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate occurrences found!');
    console.log(`   ${filesWithPattern.length} files have the pattern once (expected).`);
    console.log(`   ${results.length - filesWithPattern.length} files don't have the pattern at all.`);
  } else {
    console.log(`❌ Found ${duplicates.length} file(s) with duplicate occurrences:\n`);
    
    for (const {filePath, count} of duplicates) {
      const relativePath = filePath.replace(targetDir, '').replace(/^\//, '');
      console.log(`   📄 ${relativePath}`);
      console.log(`      Pattern appears ${count} times (expected: 1)\n`);
    }
    
    console.log('\n Summary:');
    console.log(`   Total HTML files checked: ${results.length}`);
    console.log(`   Files with duplicates: ${duplicates.length}`);
    console.log(`   Files without issues: ${results.length - duplicates.length}`);
    
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
