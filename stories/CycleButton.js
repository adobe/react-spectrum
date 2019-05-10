import {action} from '@storybook/addon-actions';
import CycleButton from '../src/CycleButton';
import PauseCircle from '../src/Icon/PauseCircle';
import PlayCircle from '../src/Icon/PlayCircle';
import React from 'react';
import {storiesOf} from '@storybook/react';
import VolumeMute from '../src/Icon/VolumeMute';
import VolumeOne from '../src/Icon/VolumeOne';
import VolumeThree from '../src/Icon/VolumeThree';
import VolumeTwo from '../src/Icon/VolumeTwo';

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
  )
  .add(
    'Volume button',
    () => renderVolumeButton({defaultAction: 'volumeOne'})
  );

function render(props = {}) {
  return (
    <CycleButton
      onAction={action('onAction')}
      onChange={action('onChange')}
      actions={[
        {name: 'play', icon: <PlayCircle />, label: 'Play'},
        {name: 'pause', icon: <PauseCircle />, label: 'Pause'}
      ]}
      {...props} />
  );
}

function renderVolumeButton(props = {}) {
  return (
    <CycleButton
      onAction={action('onAction')}
      onChange={action('onChange')}
      actions={[
        {name: 'volumeOne', icon: <VolumeOne />, label: 'Volume: 33%'},
        {name: 'volumeTwo', icon: <VolumeTwo />, label: 'Volume: 66%'},
        {name: 'volumeThree', icon: <VolumeThree />, label: 'Volume: 100%'},
        {name: 'mute', icon: <VolumeMute />, label: 'Volume: Muted'}]}
      {...props} />
  );
}
