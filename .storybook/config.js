import {configure, setAddon} from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';

import configureTypekit from '../src/utils/configureTypekit';

import './storybook.styl';
import '../src/page';

setAddon(infoAddon);

function loadStories() {
  var storiesContext = require.context('../stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

configure(loadStories, module);
