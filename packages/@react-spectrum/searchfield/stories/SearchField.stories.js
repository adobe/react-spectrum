import {action} from '@storybook/addon-actions';
import React from 'react';
import Refresh from '@spectrum-icons/workflow/Refresh';
import {SearchField} from '../';
import {storiesOf} from '@storybook/react';

const info = 'A containing element with `role="search"` has been added to define a **search** landmark region.';

storiesOf('SearchField', module)
  .add(
    'Default',
    () => renderSearchLandmark(render()),
    {info}
  )
  .add(
    'defaultValue (uncontrolled)',
    () => renderSearchLandmark(render({defaultValue: 'React'})),
    {info}
  )
  .add(
    'value (controlled)',
    () => renderSearchLandmark(render({value: 'React'})),
    {info}
  )
  .add(
    'isQuiet: true',
    () => renderSearchLandmark(render({isQuiet: true})),
    {info}
  )
  .add(
    'isDisabled: true',
    () => renderSearchLandmark(render({defaultValue: 'React', isDisabled: true})),
    {info}
  )
  .add(
    'isQuiet, isDisabled',
    () => renderSearchLandmark(render({defaultValue: 'React', isQuiet: true, isDisabled: true})),
    {info}
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
    'icon: refresh',
    () => renderSearchLandmark(render({defaultValue: 'React', icon: <Refresh />})),
    {info}
  )
  .add(
    'isQuiet, icon: refresh',
    () => renderSearchLandmark(render({defaultValue: 'React', icon: <Refresh />, isQuiet: true})),
    {info}
  )
  .add(
    'onClear',
    () => renderSearchLandmark(render({onClear: action('clear')})),
    {info}
  )
  .add(
    'autoFocus',
    () => renderSearchLandmark(render({autoFocus: true})),
    {info, chromaticProvider: {isAutoFocus: true}}
  )
  .add(
    'labelAlign: end',
    () => render({labelAlign: 'end'})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'no visible label',
    () => render({label: null, 'aria-label': 'Street address'})
  )
  .add('custom width',
    () => render({width: 300})
  )
  .add('custom width, quiet',
    () => render({width: 300, isQuiet: true})
  )
  .add('custom width, labelPosition: side',
    () => render({width: 300, labelPosition: 'side'})
  );

function renderSearchLandmark(child) {
  return <div role="search">{child}</div>;
}

function render(props = {}) {
  return (
    <SearchField
      UNSAFE_className="custom_classname"
      label="Search"
      placeholder="Enter text"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}
