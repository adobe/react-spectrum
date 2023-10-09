import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {VerticalCenter} from './layout';
import {withChromaticProvider} from './custom-addons/chromatic';


// decorator order matters, the last one will be the outer most

configureActions({
  depth: 10
});

export const parameters = {
  options: {
    storySort: (a, b) =>
      a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, {numeric: true})
  },
  a11y: {},
  layout: 'fullscreen',
  chromatic: {
    forcedColors: 'active'
  }
};

export const decorators = [
  story => (
    <VerticalCenter style={{alignItems: 'center', minHeight: null, boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
      {story()}
    </VerticalCenter>
  ),
  withChromaticProvider
];
