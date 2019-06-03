import '@babel/polyfill';
import {configure, addDecorator} from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import React from 'react';
import {StoryWrapper, VerticalCenter} from './layout';
import { withA11y } from '@storybook/addon-a11y';

addDecorator(withA11y);

addDecorator(
  withInfo({
    inline: true,
    styles: {
      infoBody: {
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: "0",
        margin: "0",
        clear: 'both'
      }
    }
  })
);

addDecorator(story => (
  <VerticalCenter style={{textAlign: 'left', padding: '0 100px 50px 100px'}}>
    {story()}
  </VerticalCenter>
));

addDecorator(story => (
  <StoryWrapper> {story()} </StoryWrapper>
));


function loadStories() {
  let storiesContext = require.context('../stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
