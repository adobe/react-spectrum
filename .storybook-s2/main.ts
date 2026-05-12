import type {StorybookConfig} from 'storybook/internal/types';
import {fileURLToPath} from 'node:url';

// const excludedProps = new Set([
//   'id',
//   'slot',
//   'onCopy',
//   'onCut',
//   'onPaste',
//   'onCompositionStart',
//   'onCompositionEnd',
//   'onCompositionUpdate',
//   'onSelect',
//   'onBeforeInput',
//   'onInput'
// ]);

const localAddon = (rel: string) => fileURLToPath(import.meta.resolve(rel));

const config: StorybookConfig = {
  stories: [
    './docs/*.mdx',
    '../packages/@react-spectrum/s2/stories/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    localAddon('./custom-addons/provider/preset.ts'),
    // "@storybook/addon-styling-webpack",
    '@storybook/addon-docs',
    '@vueless/storybook-dark-mode',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: 'storybook-react-parcel',
    options: {}
  },
  core: {
    disableWhatsNewNotifications: true
  },
  features: {
    sidebarOnboardingChecklist: false
  }
  // typescript: {
  //   reactDocgen: 'react-docgen-typescript',
  //   reactDocgenTypescriptOptions: {
  //     tsconfigPath: '../tsconfig.json',
  //     shouldExtractLiteralValuesFromEnum: true,
  //     compilerOptions: {
  //       allowSyntheticDefaultImports: false,
  //       esModuleInterop: false,
  //     },
  //     propFilter: (prop) => !prop.name.startsWith('aria-') && !excludedProps.has(prop.name),
  //   },
  // },
};
export default config;
