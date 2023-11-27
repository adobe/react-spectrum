import { themes } from "@storybook/theming";
import '../src/tailwind.css';
import {withProviderSwitcher} from './custom-addons/provider';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
    docs: {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? themes.dark : themes.light
    }
  },
};


export const parameters = {
  options: {
    storySort: (a, b) => a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
  a11y: {
    config: {
      rules: [
        {
          id: 'aria-hidden-focus',
          selector: 'body *:not([data-a11y-ignore="aria-hidden-focus"])',
        }
      ]
    }
  },
  layout: 'fullscreen',
  // Stops infinite loop memory crash when saving CSF stories https://github.com/storybookjs/storybook/issues/12747#issuecomment-1151803506
  docs: {
    source: {
      type: 'code'
    }
  }
};


export const decorators = [
  withProviderSwitcher
];

export default preview;
