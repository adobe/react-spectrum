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
        return <DocsContainer {...props} theme={dark ? themes.dark : themes.light} />;
      },
      source: {
        // code: null, // Will disable code button, and show "No code available"
        transform: (code: string) => {
          // Replace any <_ with <
          code = code.replace(/<\s?_/g, '<');
          // Replace any </_ with </
          code = code.replace(/<\/\s?_/g, '</');
          // Remove any className prop
          code = code.replace(/\s+className=".*"/g, '');
          // Remove any styles prop
          code = code.replace(/\s+styles=".*"/g, '');
          // Remove any on* prop
          code = code.replace(/\s+on[A-Z].*={.*}/g, '');
          // Replace components like <{one letter} /> with <Icon />
          code = code.replace(/<([a-z])\s?\/>/g, '<Icon />');
          // Replace <No Display Name /> with <Cloud />
          code = code.replace(/<No\sDisplay\sName\s\/>/g, '<Cloud />');
          // Move any lines with just a > to the previous line
          code = code.replace(/\n\s*>/g, '>');
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
