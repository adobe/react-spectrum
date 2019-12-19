import {action} from '@storybook/addon-actions';
import {Checkbox} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Checkbox', module)
  .addParameters({chromatic: {viewports: [350]}})
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultSelected: true',
    () => render({defaultSelected: true})
  )
  .add(
    'isSelected: true',
    () => render({isSelected: true})
  )
  .add(
    'isSelected: false',
    () => render({isSelected: false})
  )
  .add(
    'isIndeterminate: true',
    () => render({isIndeterminate: true})
  )
  .add(
    'validationState: "invalid"',
    () => render({validationState: 'invalid'})
  )
  .add(
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isEmphasized: true',
    () => render({isEmphasized: true, defaultSelected: true})
  )
  .add(
    'isEmphasized: true, isIndeterminate: true',
    () => render({isEmphasized: true, isIndeterminate: true})
  )
  .add(
    'isEmphasized: true, validationState: "invalid"',
    () => render({isEmphasized: true, validationState: 'invalid'})
  )
  .add(
    'isEmphasized: true, validationState: "invalid", isIndeterminate: true',
    () => render({isEmphasized: true, validationState: 'invalid', isIndeterminate: true})
  )
  .add(
    'isEmphasized: true, isDisabled: true',
    () => render({isEmphasized: true, isDisabled: true})
  )
  .add(
    'isReadOnly: true, isSelected: true',
    () => render({isReadOnly: true, isSelected: true})
  )
  .add(
    'autoFocus: true',
    () => render({autoFocus: true}),
    {chromaticProvider: {isAutoFocus: true}}
  )
  .add(
    'custom label',
    () => renderCustomLabel()
  )
  .add(
    'long label',
    () => (
      <Checkbox
        onChange={action('change')}>
        Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris. Italiam, fato profugus, Laviniaque venit.
      </Checkbox>
    )
  )
  .add(
    'no label',
    () => renderNoLabel({'aria-label': 'This checkbox has no visible label'})
  );

function render(props = {}) {
  return (
    <Checkbox
      onChange={action('change')}
      {...props}>
      Checkbox Label
    </Checkbox>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Checkbox
      onChange={action('change')}
      {...props}>
      <span><i>Italicized</i> Checkbox Label</span>
    </Checkbox>
  );
}

function renderNoLabel(props = {}) {
  return (
    <Checkbox
      onChange={action('change')}
      {...props} />
  );
}
