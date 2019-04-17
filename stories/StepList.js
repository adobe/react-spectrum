import {action} from '@storybook/addon-actions';
import React from 'react';
import {Step, StepList} from '../src/StepList';
import {storiesOf} from '@storybook/react';

storiesOf('StepList', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'interaction: off',
    () => render({interaction: 'off'})
  )
  .add(
    'size: small',
    () => render({size: 'S'})
  )
  .add(
    'size: large',
    () => render({size: 'L'})
  )
  .add(
    'defaultSelectedIndex: 1',
    () => render({defaultSelectedIndex: 1})
  )
  .add(
    'selectedIndex: 1',
    () => render({selectedIndex: 1})
  )
  .add(
    'no labels',
    () => render({}, [null, null, null])
  )
 .add(
    'long labels',
    () => render({}, ['My text is the longest', 'And my text is quite long', 'If this was in German', 'It would likely look wrong'])
  );

function render(props = {}, steps) {
  steps = steps || ['Step 1', 'Step 2', 'Step 3'];
  const children = steps.map((step, i) => <Step key={i}>{step}</Step>);

  return (
    <StepList
      {...props}
      onChange={action('onChange')}>
      {children}
    </StepList>
  );
}
