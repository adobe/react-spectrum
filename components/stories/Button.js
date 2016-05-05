import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Button from '../Button.jsx';

storiesOf('Button', module)
  .add('Default', () => ( render() ))
  .add('size: L', () => ( render({ size: 'L' }) ))
  .add('block: true', () => ( render({ block: true }) ))
  .add('variant: primary', () => ( render({ variant: 'primary' }) ))
  .add('variant: secondary', () => ( render({ variant: 'secondary' }) ))
  .add('variant: quiet', () => ( render({ variant: 'quiet' }) ))
  .add('variant: quiet', () => ( render({ variant: 'quiet' }) ))
  .add('variant: warning', () => ( render({ variant: 'warning' }) ))
  .add('variant: minimal', () => ( render({ variant: 'minimal' }) ))
  .add('icon: bell', () => ( render({ icon: 'bell' }) ))
  .add('iconSize: XS', () => ( render({ iconSize: 'XS' }) ))
  .add('iconSize: M', () => ( render({ iconSize: 'M' }) ))
  .add('iconSize: L', () => ( render({ iconSize: 'L' }) ))
  .add('selected: true', () => ( render({ selected: true }) ))
  .add('disabled: true', () => ( render({ disabled: true }) ))
  .add('element: a', () => ( render({ element: 'a' }) ))

function render(props = {}) {
  return (
    <Button
      icon="checkCircle"
      label="React"
      onClick={ action('click') }
      { ...props }
    />
  );
}
