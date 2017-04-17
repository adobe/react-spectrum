import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../.storybook/layout';

import Button from '../src/Button';

storiesOf('Button', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'size: L',
    () => render({ size: 'L' }),
    { inline: true }
  )
  .addWithInfo(
    'block: true',
    () => render({ block: true }),
    { inline: true }
  )
  .addWithInfo(
    'variant: primary',
    () => render({ variant: 'primary' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: secondary',
    () => render({ variant: 'secondary' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: quiet',
    () => render({ variant: 'quiet' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: quiet',
    () => render({ variant: 'quiet' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: warning',
    () => render({ variant: 'warning' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: minimal',
    () => render({ variant: 'minimal' }),
    { inline: true }
  )
  .addWithInfo(
    'icon: bell',
    () => render({ icon: 'bell' }),
    { inline: true }
  )
  .addWithInfo(
    'iconSize: XS',
    () => render({ iconSize: 'XS' }),
    { inline: true }
  )
  .addWithInfo(
    'iconSize: M',
    () => render({ iconSize: 'M' }),
    { inline: true }
  )
  .addWithInfo(
    'iconSize: L',
    () => render({ iconSize: 'L' }),
    { inline: true }
  )
  .addWithInfo(
    'selected: true',
    () => render({ selected: true }),
    { inline: true }
  )
  .addWithInfo(
    'disabled: true',
    () => render({ disabled: true }),
    { inline: true }
  )
  .addWithInfo(
    'element: a',
    () => render({ element: 'a', href: 'http://example.com' }),
    { inline: true }
  )
  .addWithInfo(
    'element: a, disabled: true',
    () => render({ element: 'a', href: 'http://example.com', disabled: true }),
    { inline: true }
  );

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
