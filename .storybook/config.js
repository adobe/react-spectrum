import { configure } from '@kadira/storybook';
import './storybook.styl';

import '../css/coral.css';

let iframeBodyClass = 'coral--light';

function loadStories() {
  var storiesContext = require.context('../src/stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
  //require('../src/stories/');
}

document.getElementsByTagName('body')[0].classList.add(iframeBodyClass);
configure(loadStories, module);
