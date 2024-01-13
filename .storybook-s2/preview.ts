import {themes} from '@storybook/theming';
import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};

document.body.className += style({backgroundColor: 'gray-25'})();

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {},
    },
    docs: {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? themes.dark : themes.light
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

export default preview;
