import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {withProviderSwitcher} from './custom-addons/provider';
import {withScrollingSwitcher} from './custom-addons/scrolling';
import {withStrictModeSwitcher} from './custom-addons/strictmode';

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 10
});

export const parameters = {
  options: {
    storySort: (a, b) => a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
  a11y: {},
  layout: 'fullscreen',
  // Stops infinite loop memory crash when saving CSF stories https://github.com/storybookjs/storybook/issues/12747#issuecomment-1151803506
  docs: {
    source: {
      type: 'code'
    }
  }
};

export const decorators = [
  withScrollingSwitcher,
  ...(process.env.NODE_ENV !== 'production' ? [withStrictModeSwitcher] : []),
  withProviderSwitcher
];
