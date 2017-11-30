import {action, storiesOf} from '@kadira/storybook';
import React from 'react';
import Refresh from '../src/Icon/Refresh';
import Search from '../src/Search';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Search', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'defaultValue (uncontrolled)',
    () => render({defaultValue: 'React'}),
    {inline: true}
  )
  .addWithInfo(
    'value (controlled)',
    () => render({value: 'React'}),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => render({value: 'React', disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'icon: refresh',
    () => render({value: 'React', icon: <Refresh />}),
    {inline: true}
  )
  .addWithInfo(
    'icon: (none)',
    () => render({value: 'React', icon: ''}),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => render({quiet: true, disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet icon: refresh',
    () => render({quiet: true, icon: <Refresh />}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Search
      placeholder="Enter text"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}
