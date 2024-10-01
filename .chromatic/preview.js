import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {VerticalCenter} from './layout';
import {withChromaticProvider} from './custom-addons/chromatic';
import isChromatic from 'chromatic/isChromatic';

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

// Use the document.fonts API to check if fonts have loaded
// https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts API to
const fontLoader = async () => {
  console.log('gawegaweg')
  return {
    fonts: await document.fonts.ready,
  }
};

/* 👇 It's configured as a global loader
 * See https://storybook.js.org/docs/writing-stories/loaders
 * to learn more about loaders
 */
const loaders = isChromatic() && document.fonts ? [fontLoader] : [];

const preview = {
  loaders: [fontLoader]
};

export default preview;
