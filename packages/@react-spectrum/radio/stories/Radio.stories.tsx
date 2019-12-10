import {action} from '@storybook/addon-actions';
import {Provider} from '@react-spectrum/provider';
import {Radio, RadioGroup} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Radio', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'defaultValue: dragons',
    () => render({defaultValue: 'dragons'})
  )
  .add(
    'controlled: dragons',
    () => render({value: 'dragons'})
  )
  .add(
    'labelPosition: bottom',
    () => render({labelPosition: 'bottom'})
  )
  .add(
    'vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'vertical, labelPosition: bottom',
    () => render({orientation: 'vertical', labelPosition: 'bottom'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isDisabled on one radio',
    () => render({}, [{}, {isDisabled: true}, {}])
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'validationState: "invalid"',
    () => render({validationState: 'invalid'})
  )
  .add(
    'no label',
    () => renderNoLabel({})
  )
  .add(
    'no label, isEmphasized',
    () => renderNoLabel({isEmphasized: true})
  )
  .add(
    'long label',
    () => renderLongLabel({})
  )
  .add(
    'independent label',
    () => renderExternalLabel()
  )
  .add(
    'provider control: isDisabled',
    () => renderFormControl()
  )
  .add(
    'autoFocus on one radio',
    () => render({}, [{}, {autoFocus: true}, {}])
  );

function render(props, radioProps = [{}, {}, {}]) {
  return (
    <RadioGroup aria-label="Favorite pet" {...props} onChange={action('onChange')} name="favorite-pet-group">
      <Radio value="dogs" {...radioProps[0]}>
        Dogs
      </Radio>
      <Radio value="cats" {...radioProps[1]}>
        Cats
      </Radio>
      <Radio value="dragons" {...radioProps[2]}>
        Dragons
      </Radio>
    </RadioGroup>
  );
}

function renderNoLabel(props, radioProps = [{}, {}, {}]) {
  return (
    <RadioGroup aria-label="Favorite pet" {...props} onChange={action('onChange')}>
      <Radio value="dogs" aria-label="Dogs" {...radioProps[0]} />
      <Radio value="cats" aria-label="Cats" {...radioProps[1]} />
      <Radio value="dragons" aria-label="Dragons" {...radioProps[2]} />
    </RadioGroup>
  );
}

function renderLongLabel(props, radioProps = [{}, {}, {}]) {
  return (
    <RadioGroup aria-label="Favorite pet" {...props} onChange={action('onChange')}>
      <Radio value="dogs" {...radioProps[0]}>
        Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs
      </Radio>
      <Radio value="cats" {...radioProps[1]}>
        Cats
      </Radio>
      <Radio value="dragons" {...radioProps[2]}>
        Dragons
      </Radio>
    </RadioGroup>
  );
}

function renderExternalLabel() {
  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <label id="the-label" htmlFor="the-radiogroup">I'm an independent label</label>
      <RadioGroup id="the-radiogroup" aria-labelledby="the-label" onChange={action('onChange')}>
        <Radio value="dogs">
          Dogs
        </Radio>
        <Radio value="cats">
          Cats
        </Radio>
        <Radio value="dragons">
          Dragons
        </Radio>
      </RadioGroup>
    </div>
  );
}

function renderFormControl() {
  return (
    <Provider isDisabled>
      <RadioGroup aria-label="Favorite pet" onChange={action('onChangePet')} name="favorite-pet-group">
        <Radio value="dogs">
          Dogs
        </Radio>
        <Radio value="cats">
          Cats
        </Radio>
        <Radio value="dragons">
          Dragons
        </Radio>
      </RadioGroup>
      <RadioGroup aria-label="Favorite cereal" onChange={action('onChangeCereal')} name="favorite-cereal-group">
        <Radio value="reeses">
          Reese's Peanut Butter Puffs
        </Radio>
        <Radio value="honeynut">
          HoneyNut Cheerios
        </Radio>
        <Radio value="cinnamon">
          Cinnamon Toast Crunch
        </Radio>
      </RadioGroup>
    </Provider>
  );
}
