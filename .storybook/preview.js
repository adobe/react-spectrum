import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {withProviderSwitcher} from './custom-addons/provider';
import {withScrollingSwitcher} from './custom-addons/scrolling';
import {withStrictModeSwitcher} from './custom-addons/strictmode';

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 2,
});

export const parameters = {
  options: {
    storySort: (a, b) => {
      return a.title === b.title
        ? 0
        : a.id.localeCompare(b.id, undefined, { numeric: true });
    }
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
  },
  darkMode: {
    light: {
      brandTitle: 'React Spectrum',
      brandImage: new URL('raw:logo.svg', import.meta.url).toString()
    },
    dark: {
      brandTitle: 'React Spectrum',
      brandImage: new URL('raw:logo-dark.svg', import.meta.url).toString()
    }
  },
};

export const decorators = [
  withScrollingSwitcher,
  ...(process.env.NODE_ENV !== 'production' ? [withStrictModeSwitcher] : []),
  withProviderSwitcher
];
