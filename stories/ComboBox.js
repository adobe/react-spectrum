/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import Bell from '../src/Icon/Bell';
import ComboBox from '../src/ComboBox';
import React from 'react';
import Seat from '../src/Icon/Seat';
import Send from '../src/Icon/Send';
import Stop from '../src/Icon/Stop';
import {storiesOf} from '@storybook/react';
import Trap from '../src/Icon/Trap';

const OPTIONS = [
  'Chocolate',
  'Vanilla',
  'Strawberry',
  'Caramel',
  'Cookies and Cream',
  'Coconut',
  'Peppermint',
  'Some crazy long value that should be cut off'
];

const OPTION_ICONS = [
  {label: 'Bell', icon: <Bell />},
  {label: 'Stop', icon: <Stop />},
  {label: 'Trap', icon: <Trap />},
  {label: 'Send', icon: <Send />},
  {label: 'Seat', icon: <Seat />}
];

const OPTIONS_KEY_PAIRS = [
  {label: 'Label 1', value: '1234'},
  {label: 'Label 2', value: '5678'},
  {label: 'Label 3', value: '9123'},
  {label: 'Label 4', value: '4567'},
  {label: 'Label 5', value: '8912'}
];

storiesOf('ComboBox', module)
  .add(
    'Default',
    () => render({options: OPTIONS, 'aria-label': 'Default'})
  )
  .add(
    'invalid',
    () => render({options: OPTIONS, 'aria-label': 'invalid', invalid: true})
  )
  .add(
    'disabled',
    () => render({options: OPTIONS, 'aria-label': 'disabled', disabled: true})
  )
  .add(
    'quiet',
    () => render({options: OPTIONS, 'aria-label': 'quiet', quiet: true})
  )
  .add(
    'quiet invalid',
    () => render({options: OPTIONS, 'aria-label': 'quiet invalid', quiet: true, invalid: true})
  )
  .add(
    'quiet disabled',
    () => render({options: OPTIONS, 'aria-label': 'quiet disabled', quiet: true, disabled: true})
  )
  .add(
    'Key Value Pairs',
    () => render({options: OPTIONS_KEY_PAIRS, 'aria-label': 'key value pairs'})
  )
  .add(
    'with icons',
    () => render({options: OPTION_ICONS, 'aria-label': 'with icons'})
  )
  .add(
    'controlled',
    () => renderControlled({options: OPTIONS})
  )
  .add(
    'renderItem',
    () => render({
      options: OPTIONS,
      'aria-label': 'renderItem',
      renderItem: (item) => <em>{item}</em>
    }),
    {info: 'This example uses renderItem method to italicize text'}
  );

function render(props = {}) {
  return (
    <ComboBox
      onChange={action('change')}
      onSelect={action('select')}
      placeholder="Combo Box"
      {...props} />
  );
}

function renderControlled(props = {}) {
  return (
    <ControlledCombo {...props} />
  );
}

class ControlledCombo extends React.Component {
  state = {
    value: 'Vanilla',
    showMenu: false
  };
  onSelect() {
    this.setState({value: 'Chocolate'});
  }
  render() {
    let props = this.props;
    return (
      <ComboBox
        onChange={action('change')}
        onSelect={this.onSelect.bind(this)}
        showMenu={this.state.showMenu}
        onMenuToggle={showMenu => this.setState({showMenu})}
        placeholder="Combo Box"
        value={this.state.value}
        {...props} />
    );
  }
}
