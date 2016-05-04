import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import '../Button.jsx';

storiesOf('Button', module)
  .add('with a text', () => (
    <button className="coral-Button coral-Button--secondary">
      <span className="coral-Icon coral-Icon--sizeS coral-Icon--checkCircle" />
      <span className="coral-Button-label">CoralUI Rocks</span>
    </button>
  ))
  .add('with no text', () => (
    <button></button>
  ));
