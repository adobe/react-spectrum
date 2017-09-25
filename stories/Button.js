import {action, storiesOf} from '@kadira/storybook';
import Button from '../src/Button';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Button', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'variant: cta',
    () => render({variant: 'cta'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: primary',
    () => render({variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: secondary',
    () => render({variant: 'secondary'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: warning',
    () => render({variant: 'warning'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: action',
    () => render({variant: 'action'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: action icon only',
    () => render({variant: 'action', label: null, icon: 'bell'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: and',
    () => render({variant: 'and'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: or',
    () => render({variant: 'or'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, variant: primary',
    () => render({quiet: true, variant: 'primary'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: secondary',
    () => render({quiet: true, variant: 'secondary'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: warning',
    () => render({quiet: true, variant: 'warning'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: action',
    () => render({quiet: true, variant: 'action'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: action icon only',
    () => render({quiet: true, variant: 'action', label: null, icon: 'bell'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: quiet',
    () => render({variant: 'quiet'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: minimal',
    () => render({variant: 'minimal'}),
    {inline: true}
  )
  .addWithInfo(
    'icon: bell',
    () => render({icon: 'bell', variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'iconSize: XS',
    () => render({iconSize: 'XS', icon: 'bell', variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'iconSize: M',
    () => render({iconSize: 'M', icon: 'bell', variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'iconSize: L',
    () => render({iconSize: 'L', icon: 'bell', variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'selected: true',
    () => render({selected: true, variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'element: a',
    () => render({element: 'a', href: 'http://example.com'}),
    {inline: true}
  )
  .addWithInfo(
    'block: true',
    () => render({block: true, variant: 'cta'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <div>
      <Button
        label="React"
        onClick={action('click')}
        {...props} />
      <Button
        label="React"
        onClick={action('click')}
        disabled
        {...props} />
    </div>
  );
}
