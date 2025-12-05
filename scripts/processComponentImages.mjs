import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = 'packages/dev/s2-docs/assets/component-illustrations';

// Mappings from source file names to target page names
const mappings = {
  'DateAndTime.avif': 'DatePicker.avif',
  'DateAndTime(range).avif': 'DateRangePicker.avif',
  'Slider(range).avif': 'RangeSlider.avif',
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
  'Releases(numbers).avif': 'Releases.avif',
  'Home.avif': 'Home.avif'
};

// Files to skip (keep as-is without renaming)
const skipRename = ['gradient-bg.png'];

async function processImages() {
  // Find all PNG files in the component-illustrations directory
  const pngFiles = fs.globSync(`${IMAGES_DIR}/**/*.png`);
  
  console.log(`Found ${pngFiles.length} PNG files to process\n`);

  for (let f of pngFiles) {
    let basename = path.basename(f);
    let newPath;
    
    // Handle special files that should keep their name (just convert to AVIF)
    if (skipRename.includes(basename)) {
      newPath = f.replace(/\.png$/, '.avif');
    } else {
      // Remove the _4-3_(Light|Dark)@2x suffix and convert kebab-case to PascalCase
      let renamed = basename
        .replace(/_4-3_(Light|Dark)@2x/, '')
        .replace(/\.png$/, '.avif')
        .replace(/-([a-z])/gi, (_, v) => v.toUpperCase())
        .replace(/^([a-z])/, (_, v) => v.toUpperCase()) // Capitalize first letter
        .replace(/ /g, ''); // Remove spaces
      
      // Apply custom mappings
      if (mappings[renamed]) {
        renamed = mappings[renamed];
      }
      
      // Build the new path, removing Components/ or Guides/ subdirectory
      newPath = path.join(path.dirname(f), renamed);
      newPath = newPath.replace(/\/components\/|\/guides\//i, '/');
    }
    
    // Convert to AVIF using sharp
    try {
      await sharp(f)
        .avif({quality: 80})
        .toFile(newPath);
      
      console.log(`✓ ${basename} -> ${path.basename(newPath)}`);
      
      // Remove the original PNG file
      fs.unlinkSync(f);
    } catch (err) {
      console.error(`✗ Error processing ${basename}:`, err.message);
    }
  }

  // Clean up empty directories
  const dirs = ['light/components', 'light/guides', 'dark/components', 'dark/guides'];
  for (let dir of dirs) {
    const fullPath = path.join(IMAGES_DIR, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      if (files.length === 0) {
        fs.rmdirSync(fullPath);
        console.log(`\nRemoved empty directory: ${dir}`);
      }
    }
  }

  console.log('\nDone!');
}

processImages().catch(console.error);

