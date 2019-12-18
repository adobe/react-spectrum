import {Form} from '../';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';

storiesOf('Form', module)
  .add(
    'Default',
    () => render({})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'custom width',
    () => render({width: 400})
  )
  .add(
    'custom width, labelPosition: side',
    () => render({width: 400, labelPosition: 'side'})
  )
  .add(
    'labelAlign: end',
    () => render({labelAlign: 'end'})
  )
  .add(
    'labelPosition: side, labelAlign: end',
    () => render({labelPosition: 'side', labelAlign: 'end'})
  )
  .add(
    'fields next to each other',
    () => (
      <Form>
        <div style={{display: 'flex'}}>
          <TextField label="First Name" placeholder="John" marginEnd="size-100" />
          <TextField label="Last Name" placeholder="Smith" />
        </div>
        <TextField label="Street Address" placeholder="123 Any Street" />
        <TextField label="Zip code" placeholder="12345" />
      </Form>
    )
  )
  .add(
    'isRequired: true',
    () => render({isRequired: true})
  )
  .add(
    'isRequired: true, necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'isRequired: false, necessityIndicator: label',
    () => render({isRequired: false, necessityIndicator: 'label'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  );

function render(props: any = {}) {
  return (
    <Form {...props}>
      <TextField label="First Name" placeholder="John" />
      <TextField label="Last Name" placeholder="Smith" />
      <TextField label="Street Address" placeholder="123 Any Street" />
      <TextField label="Zip code" placeholder="12345" />
      <RadioGroup label="Favorite pet" defaultValue="dogs">
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
    </Form>
  );
}
