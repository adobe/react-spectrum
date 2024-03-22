import '../src/page';
import {themes} from '@storybook/theming';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { store } from 'storybook-dark-mode/dist/esm/Tool';
import { addons } from '@storybook/preview-api';

const channel = addons.getChannel();
document.documentElement.dataset.colorScheme = store().current === 'dark' ? 'dark' : 'light';
channel.on(DARK_MODE_EVENT_NAME, isDark => document.documentElement.dataset.colorScheme = isDark ? 'dark' : 'light');

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {},
    },
    docs: {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? themes.dark : themes.light,
      source: {
        transform: (code: string) => {
          // Replace any <_ with <
          code = code.replace(/<\s?_/g, '<');
          // Replace any </_ with </
          code = code.replace(/<\/\s?_/g, '</');
          // Remove any className prop
          code = code.replace(/\s+className=".*"/g, '');
          return code;
        }
      }
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
