import { configure } from '@kadira/storybook';
import './storybook.styl';

import '../css/coral.css';

function loadStories() {
  var storiesContext = require.context('../lib/stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
  //require('../lib/stories/');
}

configure(loadStories, module);
