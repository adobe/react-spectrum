import type { StorybookConfig } from "@storybook/types";

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
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    './custom-addons/provider/register',
    // "@storybook/addon-styling-webpack",
    "storybook-dark-mode",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "storybook-react-parcel",
    options: {},
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
