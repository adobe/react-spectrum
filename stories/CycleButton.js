import {action, storiesOf} from '@storybook/react';
import CycleButton from '../src/CycleButton';
import PauseCircle from '../src/Icon/PauseCircle';
import PlayCircle from '../src/Icon/PlayCircle';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('CycleButton', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({}),
    {inline: true}
  )
  .addWithInfo(
    'defaultAction',
    () => render({defaultAction: 'pause'}),
    {inline: true}
  )
  .addWithInfo(
    'Controlled Component',
    () => render({action: 'play'}),
    {inline: true}
  )
  .addWithInfo(
    'Disabled',
    () => render({disabled: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <CycleButton
      onAction={action('onAction')}
      onChange={action('onChange')}
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      {...props} />
  );
}
