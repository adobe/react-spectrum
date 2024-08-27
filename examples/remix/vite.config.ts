import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import optimizeLocales from '@react-aria/optimize-locales-plugin';

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    {...optimizeLocales.vite({locales: []}), enforce: 'pre'}
  ],
});
