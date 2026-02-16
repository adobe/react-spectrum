#!/usr/bin/env node
/**
 * Script to validate s2-docs build output.
 * - Confirms the build directory exists and contains files.
 * - Checks for duplicate </script></body></html> occurrences in HTML files.
 *
 * Usage: node scripts/validateS2DocsBuild.mjs [directory]
 * Default directory: ./dist
 */

import {dirname, join} from 'path';
import fg from 'fast-glob';
import {fileURLToPath} from 'url';
import {readFile, stat} from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATTERN = '</script></body></html>';

async function collectBuildFiles(dir) {
  const files = await fg(['**/*'], {
    cwd: dir,
    onlyFiles: true,
    dot: true,
    absolute: true
  });

  const htmlFiles = files.filter(filePath => filePath.endsWith('.html'));
  return {htmlFiles, totalFiles: files.length};
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
  
  console.log('\nValidating s2-docs build output...');
  console.log(`Directory: ${targetDir}\n`);

  let dirStats;
  try {
    dirStats = await stat(targetDir);
  } catch {
    console.error(`Build directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  if (!dirStats.isDirectory()) {
    console.error(`Build path is not a directory: ${targetDir}`);
    process.exit(1);
  }

  let htmlFiles;
  let totalFiles;
  try {
    ({htmlFiles, totalFiles} = await collectBuildFiles(targetDir));
  } catch (error) {
    console.error(`Error reading build directory: ${error.message}`);
    process.exit(1);
  }

  if (totalFiles === 0) {
    console.error('Build directory is empty. No files found.');
    process.exit(1);
  }

  if (htmlFiles.length === 0) {
    console.error('No HTML files found in the build output.');
    process.exit(1);
  }

  console.log(`Found ${htmlFiles.length} HTML files to check.\n`);
  
  const results = await Promise.all(htmlFiles.map(checkFile));
  const duplicates = results.filter(r => r.hasDuplicate);
  
  if (duplicates.length === 0) {
    console.log('✅ All HTML validated for duplicate \'</script></body></html>\' occurrences.');
  } else {
    console.log(`❌ Found ${duplicates.length} file(s) with duplicate '</script></body></html>' occurrences:\n`);
    
    for (const {filePath, count} of duplicates) {
      const relativePath = filePath.replace(targetDir, '').replace(/^\//, '');
      console.log(`   📄 ${relativePath}`);
      console.log(`      Pattern appears ${count} times (expected: 1)\n`);
    }
    
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
