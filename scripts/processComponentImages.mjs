import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = 'packages/dev/s2-docs/assets/component-illustrations';

// Mappings from source file names to target page names
const mappings = {
  'DateAndTime.avif': 'DatePicker.avif',
  'DateAndTime(Range).avif': 'DateRangePicker.avif',
  'Slider(Range).avif': 'RangeSlider.avif',
  'InLineAlert.avif': 'InlineAlert.avif',
  'CardsView.avif': 'CardView.avif',
  'Cards.avif': 'Card.avif',
  'Images.avif': 'Image.avif',
  'Swatch.avif': 'ColorSwatch.avif',
  'SwatchGroup.avif': 'ColorSwatchPicker.avif',
  'TreeView.avif': 'Tree.avif',
  'SelectBox.avif': 'SelectBoxGroup.avif',
  'MigratingToSpectrum3.avif': 'MigratingToSpectrum3.avif',
  'MigratingToSpectrum2.avif': 'MigratingToSpectrum2.avif',
  "What'sNew.avif": 'WhatsNew.avif',
  'Releases(Numbers).avif': 'Releases.avif',
  'Home.avif': 'Home.avif',
  'MCPServer.avif': 'McpServer.avif'
};

function transformFilename(basename) {
  // Remove the _4-3_(Light|Dark)@2x suffix and convert kebab-case to PascalCase
  let renamed = basename
    .replace(/_4-3_(Light|Dark)@2x/i, '')
    .replace(/\.png$/i, '.avif')
    .replace(/-([a-z])/gi, (_, v) => v.toUpperCase())
    .replace(/^([a-z])/, (_, v) => v.toUpperCase()) // Capitalize first letter
    .replace(/ /g, ''); // Remove spaces

  // Apply custom mappings
  if (mappings[renamed]) {
    renamed = mappings[renamed];
  }

  return renamed;
}

async function processImages(sourceDir) {
  if (!sourceDir) {
    console.error('Usage: node scripts/processComponentImages.mjs <source-directory>');
    console.error('Example: node scripts/processComponentImages.mjs temp');
    process.exit(1);
  }

  // Resolve the source directory
  sourceDir = path.resolve(sourceDir);
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory "${sourceDir}" does not exist.`);
    process.exit(1);
  }

  console.log(`Processing images from: ${sourceDir}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Ensure output directories exist
  fs.mkdirSync(path.join(OUTPUT_DIR, 'light'), {recursive: true});
  fs.mkdirSync(path.join(OUTPUT_DIR, 'dark'), {recursive: true});

  let processedCount = 0;

  // Process background images
  const backgrounds = [
    {src: 'Backgrounds/Gradient_Light_@2x.png', dest: 'light/gradient-bg.avif'},
    {src: 'Backgrounds/Gradient_Dark_@2x.png', dest: 'dark/gradient-bg.avif'}
  ];

  for (const bg of backgrounds) {
    const srcPath = path.join(sourceDir, bg.src);
    const destPath = path.join(OUTPUT_DIR, bg.dest);
    
    if (fs.existsSync(srcPath)) {
      try {
        await sharp(srcPath)
          .avif({quality: 80})
          .toFile(destPath);
        console.log(`✓ ${bg.src} -> ${bg.dest}`);
        processedCount++;
      } catch (err) {
        console.error(`✗ Error processing ${bg.src}:`, err.message);
      }
    }
  }

  // Process Light mode and Dark mode directories
  const modes = [
    {srcFolder: 'Light mode', destFolder: 'light'},
    {srcFolder: 'Dark mode', destFolder: 'dark'}
  ];

  for (const mode of modes) {
    const modeDir = path.join(sourceDir, mode.srcFolder);
    
    if (!fs.existsSync(modeDir)) {
      console.log(`Skipping ${mode.srcFolder} (directory not found)`);
      continue;
    }

    // Process both Components and Guides subdirectories
    const subdirs = ['Components', 'Guides'];
    
    for (const subdir of subdirs) {
      const fullSubdir = path.join(modeDir, subdir);
      
      if (!fs.existsSync(fullSubdir)) {
        continue;
      }

      const files = fs.readdirSync(fullSubdir).filter(f => f.toLowerCase().endsWith('.png'));
      
      for (const file of files) {
        const srcPath = path.join(fullSubdir, file);
        const newFilename = transformFilename(file);
        const destPath = path.join(OUTPUT_DIR, mode.destFolder, newFilename);
        
        try {
          await sharp(srcPath)
            .avif({quality: 80})
            .toFile(destPath);
          console.log(`✓ ${mode.srcFolder}/${subdir}/${file} -> ${mode.destFolder}/${newFilename}`);
          processedCount++;
        } catch (err) {
          console.error(`✗ Error processing ${file}:`, err.message);
        }
      }
    }
  }

  console.log(`\nDone! Processed ${processedCount} images.`);
}

// Get source directory from command line arguments
const sourceDir = process.argv[2];
processImages(sourceDir).catch(console.error);
