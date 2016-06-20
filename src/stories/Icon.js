import React from 'react';
import { storiesOf } from '@kadira/storybook';

import Icon from '../Icon';

storiesOf('Icon', module)
  .add('Default', () => (render()))
  .add('icon: bell', () => (render({ icon: 'bell' })))
  .add('icon: twitterColor', () => (render({ icon: 'twitterColor' })))
  .add('size: XS', () => (render({ size: 'XS' })))
  .add('size: S', () => (render({ size: 'S' })))
  .add('size: L', () => (render({ size: 'L' })))
  .add('size: XL', () => (render({ size: 'XL' })));

function render(props = {}) {
  return (
    <Icon icon="add" { ...props } />
  );
}
