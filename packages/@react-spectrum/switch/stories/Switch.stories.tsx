import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Switch} from '../';

storiesOf('Switch', module)
  .addParameters({chromaticProvider: {rtl: true}, chromatic: {viewports: [350]}})
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
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isEmphasized: true',
    () => render({isEmphasized: true})
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
      <Switch
        onChange={action('change')}>
        Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris. Italiam, fato profugus, Laviniaque venit.
      </Switch>
    )
  )
  .add(
    'no label',
    () => renderNoLabel({'aria-label': 'This switch has no visible label'})
  );

function render(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props}>
      Switch Label
    </Switch>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props}>
      <span><i>Italicized</i> Switch Label</span>
    </Switch>
  );
}

function renderNoLabel(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props} />
  );
}
