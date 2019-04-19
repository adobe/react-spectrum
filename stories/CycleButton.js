import {action} from '@storybook/addon-actions';
import CycleButton from '../src/CycleButton';
import PauseCircle from '../src/Icon/PauseCircle';
import PlayCircle from '../src/Icon/PlayCircle';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('CycleButton', module)
  .add(
    'Default',
    () => render({})
  )
  .add(
    'defaultAction',
    () => render({defaultAction: 'pause'})
  )
  .add(
    'Controlled Component',
    () => render({action: 'play'})
  )
  .add(
    'Disabled',
    () => render({disabled: true})
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
