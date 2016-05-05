import { configure } from '@kadira/storybook';
import './storybook.styl';

import '../css/coral.css';

function loadStories() {
  var storiesContext = require.context('../components/stories', true, /^(.*\.(js|jsx))$/);
  storiesContext.keys().forEach(storiesContext);
  //require('../components/stories/');
}

configure(loadStories, module);
