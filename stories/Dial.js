import {action, storiesOf} from '@storybook/react';
import Dial from '../src/Dial';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Dial', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'renderLabel: true',
    () => render({renderLabel: true, label: 'Rendered Label'}),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => render({variant: 'round', label: 'size: L'}),
    {inline: true}
  )
  .addWithInfo(
    'size: S',
    () => render({variant: 'round', size: 'S', label: 'size: S'}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'variant: with aria-label',
    () => render({renderLabel: true, 'aria-label': 'variant: with aria-label'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: with aria-labelledby',
    () => (
      <div>
        <FieldLabel label="variant: with aria-labelledby" labelFor="foo" id="bar" />
        {render({id: 'foo', 'aria-labelledby': 'bar'})}
      </div>
    ),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Dial
      onChange={action('change')}
      {...props} />
  );
}
