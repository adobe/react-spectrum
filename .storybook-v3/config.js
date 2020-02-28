import 'storybook-chromatic';
import {configure, addDecorator, addParameters} from '@storybook/react';
import {configureActions} from '@storybook/addon-actions';
import isChromatic from 'storybook-chromatic/isChromatic';
import React from 'react';
import {VerticalCenter} from './layout';
import { withA11y } from '@storybook/addon-a11y';
import {withProviderSwitcher} from './custom-addons/provider';
import {withChromaticProvider} from './custom-addons/chromatic';

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 1
});

addParameters({
  options: {
    storySort: (a, b) => a[1].id.localeCompare(b[1].id)
  }
});

addDecorator(withA11y);

addDecorator(story => (
  <VerticalCenter style={{textAlign: 'left', padding: '50px', minHeight: isChromatic() ? null : '100vh', boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: '100%'}}>{story()}</div>
  </VerticalCenter>
));

if (isChromatic()) {
  addDecorator(withChromaticProvider);
} else {
  addDecorator(withProviderSwitcher);
}

function loadStories() {
  let storiesContext = require.context('../packages', true, /^(.*\/stories\/.*?\.(js|jsx|ts|tsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
