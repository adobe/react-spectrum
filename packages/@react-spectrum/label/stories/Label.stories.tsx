import {Label} from '../';
import React from 'react';
import {SpectrumLabelProps} from '@react-types/label';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';

storiesOf('Label', module)
  .add(
    'Default',
    () => render({})
  )
  .add(
    'labelAlign: start',
    () => render({labelAlign: 'start', width: '100%'})
  )
  .add(
    'labelAlign: end',
    () => render({labelAlign: 'end', width: '100%'})
  )
  .add(
    'labelPosition: side, labelAlign: start',
    () => render({labelPosition: 'side', labelAlign: 'start', width: 80})
  )
  .add(
    'labelPosition: side, labelAlign: end',
    () => render({labelPosition: 'side', labelAlign: 'end', width: 80})
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'necessityIndicator: icon',
    () => render({isRequired: true, necessityIndicator: 'icon'})
  )
  .add(
    'necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'isRequired: false, necessityIndicator: label',
    () => render({isRequired: false, necessityIndicator: 'label'})
  );

function render(props: SpectrumLabelProps = {}) {
  return (
    <div style={{whiteSpace: 'nowrap'}}>
      <Label {...props} for="test">Test</Label>
      <TextField placeholder="React" id="test" isRequired={props.isRequired} />
    </div>
  );
}
