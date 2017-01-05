import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import StepList from '../StepList';
import Step from '../Step';

storiesOf('StepList', module)
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
    'interaction: off',
    () => render({ interaction: 'off' }),
    { inline: true }
  )
  .addWithInfo(
    'size: small',
    () => render({ size: 'S' }),
    { inline: true }
  )
  .addWithInfo(
    'defaultSelectedIndex: 1',
    () => render({ defaultSelectedIndex: 1 }),
    { inline: true }
  )
  .addWithInfo(
    'selectedIndex: 1',
    () => render({ selectedIndex: 1 }),
    { inline: true }
  )
  .addWithInfo(
    'no labels',
    () => render({}, [null, null, null]),
    { inline: true }
  )
 .addWithInfo(
    'long labels',
    () => render({}, ['My text is the longest', 'And my text is quite long', 'If this was in German', 'It would likely look wrong']),
    { inline: true }
  );

function render(props = {}, steps) {
  steps = steps || ['Step 1', 'Step 2', 'Step 3'];
  const children = steps.map((step, i) => <Step key={ i }>{ step }</Step>);

  return (
    <StepList
      { ...props }
      onChange={ action('onChange') }
    >
      {children}
    </StepList>
  );
}
