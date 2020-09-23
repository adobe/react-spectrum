import 'storybook-chromatic';
import {configure, addDecorator, addParameters} from '@storybook/react';
import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {VerticalCenter} from './layout';
import { withA11y } from '@storybook/addon-a11y';
import {withChromaticProvider} from './custom-addons/chromatic';

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 1
});

addParameters({
  options: {
    storySort: (a, b) => a[1].kind.localeCompare(b[1].kind),
    enableShortcuts: false
  }
});

addDecorator(withA11y);

addDecorator(story => (
  <VerticalCenter style={{alignItems: 'center', minHeight: null, boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
    {story()}
  </VerticalCenter>
));

addDecorator(withChromaticProvider);


function loadStories() {
  let storiesContext = require.context('../packages', true, /^(.*\/chromatic\/.*?\.(js|jsx|ts|tsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
