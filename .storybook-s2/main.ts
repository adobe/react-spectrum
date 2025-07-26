import type { StorybookConfig } from "storybook/internal/types";

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

const config: StorybookConfig = {
  stories: [
    './docs/*.mdx',
    "../packages/@react-spectrum/s2/stories/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    './custom-addons/provider/register',
    // "@storybook/addon-styling-webpack",
    "@vueless/storybook-dark-mode",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "storybook-react-parcel",
    options: {},
  },
  core: {
    disableWhatsNewNotifications: true
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
