import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Progress from '../Progress';

storiesOf('Progress', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('value: 50', () => render({ value: 50 }))
  .add('value: 100', () => render({ value: 100 }))
  .add('indeterminate: true', () => render({ indeterminate: true, value: 50 }))
  .add('size: S', () => render({ size: 'S', value: 50 }))
  .add('size: L', () => render({ size: 'L', value: 50 }))
  .add('showPercent: true', () => render({ showPercent: true, value: 50 }))
  .add('labelPosition: left', () => render({ showPercent: true, labelPosition: 'left', value: 50 }))
  .add('labelPosition: bottom', () => render({ showPercent: true, labelPosition: 'bottom', value: 50 }))
  .add('label: React', () => render({ label: 'React', value: 50 }));

function render(props = {}) {
  return (
    <Progress { ...props } />
  );
}
