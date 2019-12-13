import {action} from '@storybook/addon-actions';
import {Checkbox} from '@react-spectrum/checkbox';
import {FieldLabel} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';


storiesOf('FieldLabel', module)
  .add(
    'Default',
    () => render({label: 'Checkbox Group'})
  )
  .add(
    'labelAlign: start',
    () => renderAlign({label: 'Checkbox Group', labelFor: 'test', labelAlign: 'start', UNSAFE_style: {width: '200px'}})
  )
  .add(
    'labelAlign: end',
    () => renderAlign({label: 'Checkbox Group', labelFor: 'test', labelAlign: 'end', UNSAFE_style: {width: '200px'}})
  )
  .add(
    'labelFor',
    () => (
      <div>
        <FieldLabel label="React" labelFor="test" />
        <TextField placeholder="React" id="test" />
      </div>
    )
  )
  .add(
    'required styles',
    () => (
      <div>
        {renderTextfield({label: 'Required label', isRequired: true, necessityIndicator: 'label'})}
        {renderTextfield({label: 'Optional label', isRequired: false, necessityIndicator: 'label'})}
        {renderTextfield({label: 'React', isRequired: true, necessityIndicator: 'icon'})}
        {renderTextfield({label: 'React', isRequired: false, necessityIndicator: 'icon'})}
      </div>
    )
  );

function render(props) {
  return (
    <FieldLabel {...props}>
      <Checkbox
        onChange={action('change')}>
        Dogs
      </Checkbox>
      <Checkbox
        onChange={action('change')}>
        Cats
      </Checkbox>
      <Checkbox
        onChange={action('change')}>
        Dragons
      </Checkbox>
    </FieldLabel>
  );
}

function renderAlign(props) {
  return (
    <div>
      <FieldLabel {...props} />
      <Checkbox
        onChange={action('change')}
        id="test">
        Dogs
      </Checkbox>
    </div>
  );
}

function renderTextfield(props = {}) {
  return (<FieldLabel {...props}><TextField placeholder="React" /></FieldLabel>);
}
