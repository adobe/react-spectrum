import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {VerticalCenter} from './layout';
import {withProviderSwitcher} from './custom-addons/provider';

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 10
});

export const parameters = {
  options: {
    storySort: (a, b) => a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
  a11y: {},
  layout: 'fullscreen'
};

export const decorators = [
  story => (
    <div style={{overflow: 'auto', height: '100vh', width: '100vw'}}>
      <VerticalCenter style={{alignItems: 'center', height: '300vh', width: '300vw', boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
        {story()}
      </VerticalCenter>
    </div>
  ),
  withProviderSwitcher
];
