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
  styles: (s) => {
    s.infoBody.backgroundColor = 'transparent';
    s.infoBody.border = 'none';
    s.infoBody.boxShadow = 'none';
    s.infoBody.padding = '10px 0';
    s.infoBody.marginTop = 0;
    s.infoBody.clear = 'both'
    return s;
  }
});

function loadStories() {
  var storiesContext = require.context('../stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
