import 'babel-polyfill';
import {configure, setAddon, addDecorator} from '@storybook/react';
import configureTypekit from '../src/utils/configureTypekit';
import infoAddon, {setDefaults} from '@storybook/addon-info';
import React from 'react';
import {StoryWrapper} from './layout';

import './storybook.styl';

setAddon(infoAddon);

addDecorator(story => (
  <StoryWrapper> {story()} </StoryWrapper>
));

// addon-info
setDefaults({
  inline: true,
  styles: {
    infoBody: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: '10px 0',
      marginTop: '0',
      clear: 'both'
    }
  }
});

function loadStories() {
  var storiesContext = require.context('../stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
