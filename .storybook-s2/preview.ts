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
    }
  },
};


export const parameters = {
  options: {
    storySort: (a: any, b: any) => a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
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
  layout: 'fullscreen'
};


export const decorators = [
  withProviderSwitcher
];

export default preview;
