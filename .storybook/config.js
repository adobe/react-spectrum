import 'storybook-chromatic';
import {configure, addDecorator, addParameters} from '@storybook/react';
import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import {VerticalCenter} from './layout';
import { withA11y } from '@storybook/addon-a11y';
import {withProviderSwitcher} from './custom-addons/provider';

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
  <VerticalCenter style={{alignItems: 'center', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
    {story()}
  </VerticalCenter>
));

addDecorator(withProviderSwitcher);


function loadStories() {
  let storiesContext = require.context('../packages', true, /^(.*\/stories\/.*?\.(js|jsx|ts|tsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
