import { configure } from '@kadira/storybook';
import '../css/coral.css';

function loadStories() {
  require('../components/stories/');
}

configure(loadStories, module);
