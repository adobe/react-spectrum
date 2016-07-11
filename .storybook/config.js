import React from 'react';
import { configure, setAddon } from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';

import './storybook.styl';
import '../css/coral.css';

setAddon(infoAddon);

let iframeBodyClass = 'coral--light';

function loadStories() {
  var storiesContext = require.context('../src/stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
}

document.getElementsByTagName('body')[0].classList.add(iframeBodyClass);
configure(loadStories, module);
