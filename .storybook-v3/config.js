import {configure, addDecorator} from '@storybook/react';
import React from 'react';
import {StoryWrapper, VerticalCenter} from './layout';
import { withA11y } from '@storybook/addon-a11y';

addDecorator(withA11y);

addDecorator(story => (
  <VerticalCenter style={{textAlign: 'left', padding: '50px 100px 50px 100px', minHeight: '100vh', boxSizing: 'border-box'}}>
    {story()}
  </VerticalCenter>
));

addDecorator(story => (
  <StoryWrapper> {story()} </StoryWrapper>
));


function loadStories() {
  let storiesContext = require.context('../packages', true, /^(.*\/stories\/.*?\.(js|jsx|ts|tsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
