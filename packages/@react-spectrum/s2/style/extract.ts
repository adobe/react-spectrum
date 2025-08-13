import * as fs from 'fs';
import * as path from 'path';
import {
  ThemeMode,
  DeviceKind,
  ThemeDeviceKey,
  generateTokenValueMap,
  addPxToSpacing,
  TokenPayload
} from './s2-style-tokens';

// Write 4 separate token value JSON files: light-desktop, light-mobile, dark-desktop, dark-mobile.
const baseDir = path.resolve(process.cwd(), 'packages/@react-spectrum/s2/style');

// Ensure target directory exists.
fs.mkdirSync(baseDir, {recursive: true});

// Process each mode sequentially: generate map, write file, then next mode

for (const mode of ['light-desktop', 'light-mobile', 'dark-desktop', 'dark-mobile']) {
  const [theme, device] = mode.split('-') as [ThemeMode, DeviceKind];
  
  // Generate map for this mode
  const payload = generateTokenValueMap(theme, device);
  
  // Write file for this mode
  const filePath = path.join(baseDir, `token-values.${mode}.json`);
  const enhanced = addPxToSpacing(payload as TokenPayload);
  fs.writeFileSync(filePath, JSON.stringify(enhanced, null, 2), 'utf-8');
  console.log(`Wrote token values to ${filePath}`);
}
