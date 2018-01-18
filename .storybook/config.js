import 'babel-polyfill';
import {configure, setAddon} from '@storybook/react';
import infoAddon, {setDefaults} from '@storybook/addon-info';

import configureTypekit from '../src/utils/configureTypekit';

import './storybook.styl';
import '../src/page';

setAddon(infoAddon);

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
