import {configure, setAddon} from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';

import configureTypekit from '../src-old/configureTypekit';

import './storybook.styl';
import '../src/page/index.styl';

setAddon(infoAddon);
configureTypekit('ruf7eed');

let iframeBodyClass = 'coral--light';

function loadStories() {
  var storiesContext = require.context('../stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

document.getElementsByTagName('body')[0].classList.add(iframeBodyClass);
configure(loadStories, module);
