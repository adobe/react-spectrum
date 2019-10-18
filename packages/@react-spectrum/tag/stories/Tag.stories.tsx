import {action} from '@storybook/addon-actions';
import Camera from '@spectrum-icons/workflow/Camera';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tag} from '../src';

storiesOf('Tag', module)
  .add(
    'default',
    () => render({}, 'Cool tag')
  )
  .add(
    'disabled',
    () => render({isDisabled: true}, 'Cool tag')
  )
  .add(
    'icon',
    () => render({
      icon: <Camera />
    }, 'Cool tag')
  )
  .add(
    'removable',
    () => render({
      onRemove: action('onRemove'),
      isRemovable: true
    }, 'Cool tag')
  )
  .add(
    'invalid',
    () => render({
      validationState: 'invalid'
    }, 'Cool tag')
  )
  .add(
    'invalid, removable',
    () => render({
      validationState: 'invalid',
      onRemove: action('onRemove'),
      isRemovable: true
    }, 'Cool tag')
  )
  .add(
    'icon, removable',
    () => render({
      icon: <Camera />,
      onRemove: action('onRemove'),
      isRemovable: true
    }, 'Cool tag')
  )
  .add(
  'disabled icon, removable',
  () => render({
    isDisabled: true,
    icon: <Camera />,
    onRemove: action('onRemove'),
    isRemovable: true
  }, 'Cool tag')
);

function render(props, childText: string) {
  return (
    <Tag {...props}>
      {childText}
    </Tag>
  );
}
