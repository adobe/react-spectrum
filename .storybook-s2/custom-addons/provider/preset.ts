import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Preset that registers our manager entry (register.tsx) with Storybook.
 * The manager builder will bundle register.tsx and transpile JSX there;
 * this file stays JS-free so Node can load it as a preset.
 * @see https://github.com/storybookjs/addon-kit
 */
export const managerEntries = (existing: string[] = []) => [
  ...existing,
  path.join(__dirname, "register.tsx"),
];
