import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';

storiesOf('FieldLabel', module)
  .add(
    'Default',
    () => render({label: 'React'})
  )
  .add(
    'labelFor: foo',
    () => (
      <FieldLabel label="React" labelFor="foo">
        <Textfield placeholder="React" id="foo" />
      </FieldLabel>
    )
  )
  .add(
    'position: left',
    () => render({label: 'React', position: 'left', style: {width: '100px'}})
  )
  .add(
    'position: right',
    () => render({label: 'React', position: 'right', style: {width: '100px'}})
  )
  .add(
    'label only',
    () => (
      <div>
        <FieldLabel label="React" labelFor="test" />
        <Textfield placeholder="React" id="test" />
      </div>
    )
  )
  .add(
    'required styles',
    () => (
      <div>
        {render({label: 'React', necessity: 'required', necessityIndicator: 'label'})}
        {render({label: 'React', necessity: 'optional', necessityIndicator: 'label'})}
        {render({label: 'React', necessity: 'required', necessityIndicator: 'icon'})}
      </div>
    )
  );

function render(props = {}) {
  return (<FieldLabel {...props}><Textfield placeholder="React" /></FieldLabel>);
}
