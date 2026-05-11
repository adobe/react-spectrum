import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Preset that registers our manager entry (register.tsx) with Storybook.
 * The manager builder will bundle register.tsx and transpile JSX there;
 * this file stays JS-free so Node can load it as a preset.
 * In plain english, this is needed so that register can be a tsx file.
 * @see https://github.com/storybookjs/addon-kit
 * @see https://storybook.js.org/docs/addons/writing-presets#managerentries
 */
export const managerEntries = (existing: string[] = []) => [
  ...existing,
  path.join(__dirname, 'register.tsx')
];
