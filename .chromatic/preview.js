import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {VerticalCenter} from './layout';
import {withChromaticProvider} from './custom-addons/chromatic';


// decorator order matters, the last one will be the outer most

configureActions({
  depth: 2
});

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['*', 'S2', 'S2 Chromatic']
    }
  },
  a11y: {},
  layout: 'fullscreen'
};

export const decorators = [
  story => (
    <VerticalCenter style={{alignItems: 'center', minHeight: null, boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
      {story()}
    </VerticalCenter>
  ),
  withChromaticProvider
];
