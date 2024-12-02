import '@react-spectrum/s2/src/page';
import { themes } from '@storybook/theming';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { store } from 'storybook-dark-mode/dist/esm/Tool';
import { addons } from '@storybook/preview-api';
import { DocsContainer } from '@storybook/addon-docs';
import React, { useEffect, useState } from 'react';
import {withProviderSwitcher} from './custom-addons/provider';
import './global.css';

const channel = addons.getChannel();
document.documentElement.dataset.colorScheme = store().current === 'dark' ? 'dark' : 'light';
channel.on(DARK_MODE_EVENT_NAME, isDark => document.documentElement.dataset.colorScheme = isDark ? 'dark' : 'light');

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {},
      exclude: ['key', 'ref']
    },
    docs: {
      container: (props) => {
        let [dark, setDark] = useState(store().current === 'dark');
        useEffect(() => {
          channel.on(DARK_MODE_EVENT_NAME, setDark);
          return () => channel.removeListener(DARK_MODE_EVENT_NAME, setDark);
        }, []);
        var style = getComputedStyle(document.body)
        return <DocsContainer {...props} theme={{...(dark ? themes.dark : themes.light), appContentBg: style.getPropertyValue('--s2-container-bg').trim()}} />;
      },
      source: {
        // code: null, // Will disable code button, and show "No code available"
        transform: (code: string, ctx) => {
          code = ctx.parameters.docs?.source?.originalSource ?? code;
          code = code.replace(/ \{\.\.\.args\}/g, '');
          if (/^(.*?) =>/.test(code)) {
            code = code.replace(/^(.*?) => /, '');
            code = code.replace(/^\s{2}(\s+)/gm, '$1');
            code = code.replace(/\n\s{2}(.*)$/, '\n$1');
          }
          return code;
        }
      }
    },
    darkMode: {
      light: {
        ...themes.light,
        brandTitle: 'React Spectrum - Spectrum 2 Preview',
        brandImage: new URL('raw:logo.svg', import.meta.url).toString()
      },
      dark: {
        ...themes.dark,
        brandTitle: 'React Spectrum - Spectrum 2 Preview',
        brandImage: new URL('raw:logo-dark.svg', import.meta.url).toString()
      }
    },
    options: {
      storySort: {
        order: ['Intro', 'Style Macro', 'Workflow Icons', 'Illustrations', 'Migrating', 'Release Notes'],
        method: 'alphabetical'
      }
    }
  },
  argTypes: {
    styles: {
      table: {category: 'Styles'},
      control: {disable: true},
    },
    UNSAFE_className: {
      table: {category: 'Styles'},
      control: {disable: true},
    },
    UNSAFE_style: {
      table: {category: 'Styles'},
      control: {disable: true},
    }
  }
};

export const parameters = {
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
};



export const decorators = [
  withProviderSwitcher
];

export default preview;
