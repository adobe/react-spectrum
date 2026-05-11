import {addons} from 'storybook/preview-api';
import {configureActions} from 'storybook/actions';
import {DARK_MODE_EVENT_NAME} from '@vueless/storybook-dark-mode';
import React from 'react';
import {withProviderSwitcher} from './custom-addons/provider';
import {withScrollingSwitcher} from './custom-addons/scrolling';
import {withStrictModeSwitcher} from './custom-addons/strictmode';

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 2
});

// Reflect storybook-dark-mode state on the document root so global CSS / consumers
// can react. Mirrors the .storybook-s2 setup. Initial value comes from the addon's
// localStorage key so the very first paint is correct.
const DARK_MODE_STORAGE_KEY = 'sb-addon-themes-3';
function getInitialColorScheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored) {
      const {current} = JSON.parse(stored);
      return current === 'dark' ? 'dark' : 'light';
    }
  } catch (e) {}
  return 'light';
}

if (typeof document !== 'undefined') {
  document.documentElement.dataset.colorScheme = getInitialColorScheme();
  addons.getChannel().on(DARK_MODE_EVENT_NAME, isDark => {
    document.documentElement.dataset.colorScheme = isDark ? 'dark' : 'light';
  });
}

export const parameters = {
  options: {
    storySort: (a, b) => {
      return a.title === b.title ? 0 : a.id.localeCompare(b.id, undefined, {numeric: true});
    }
  },
  a11y: {
    config: {
      rules: [
        {
          id: 'aria-hidden-focus',
          selector: 'body *:not([data-a11y-ignore="aria-hidden-focus"])'
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
  }
};

export const decorators = [
  withScrollingSwitcher,
  ...(process.env.NODE_ENV !== 'production' ? [withStrictModeSwitcher] : []),
  withProviderSwitcher
];
