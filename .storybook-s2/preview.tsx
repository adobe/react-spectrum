import '@react-spectrum/s2/page.css';
import { themes } from 'storybook/theming';
import { DARK_MODE_EVENT_NAME, useDarkMode } from '@vueless/storybook-dark-mode';
import { addons } from 'storybook/preview-api';
import React from 'react';
import {withProviderSwitcher} from './custom-addons/provider';
import {DocsContainer, Controls, Description, Primary, Stories, Subtitle, Title} from '@storybook/addon-docs/blocks';
import './global.css';

const DARK_MODE_STORAGE_KEY = 'sb-addon-themes-3';

function getInitialColorScheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored) {
      const { current } = JSON.parse(stored);
      return current === 'dark' ? 'dark' : 'light';
    }
  } catch {}
  return 'light';
}

const channel = addons.getChannel();
document.documentElement.dataset.colorScheme = getInitialColorScheme();
channel.on(DARK_MODE_EVENT_NAME, (isDark: boolean) => {
  document.documentElement.dataset.colorScheme = isDark ? 'dark' : 'light';
});

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {},
      exclude: ['key', 'ref']
    },
    docs: {
      container: (props) => {
        const dark = useDarkMode();
        var style = getComputedStyle(document.body);
        return <DocsContainer {...props} theme={{...(dark ? themes.dark : themes.light), appContentBg: style.getPropertyValue('--s2-container-bg').trim()}} />;
      },
      codePanel: true,
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
      },
      page: () => {
        return (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </>
      )}
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
