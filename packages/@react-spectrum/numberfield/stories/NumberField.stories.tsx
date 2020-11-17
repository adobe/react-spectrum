/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {chain} from '@react-aria/utils';
import {Form} from '@react-spectrum/form';
import {Item, Picker} from '@react-spectrum/picker';
import {NumberField} from '../src';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('NumberField', module)
  .addParameters({providerSwitcher: {status: 'notice'}})
  .addDecorator(story => (
    <ErrorBoundary>{story()}</ErrorBoundary>
  ))
  .add(
    'default',
    () => render({})
  )
  .add(
    'defaultValue: 10',
    () => render({defaultValue: 10})
  )
  .add(
    'value: 10',
    () => render({value: 10})
  )
  .add(
    'currency',
    () => render({formatOptions: {style: 'currency', currency: 'EUR'}})
  )
  .add(
    'percent',
    () => render({formatOptions: {style: 'percent'}})
  )
  .add(
    'percent min = 2 max = 2 fraction digits',
    () => render({formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}})
  )
  .add(
    'percent min = 2 max = 3 fraction digits',
    () => render({formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 3}})
  )
  .add(
    'percent using sign',
    () => render({formatOptions: {style: 'unit', unit: 'percent', signDisplay: 'always'}})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  )
  .add(
    'validationState: invalid, isQuiet',
    () => render({validationState: 'invalid', isQuiet: true})
  )
  .add(
    'validationState: valid, isQuiet',
    () => render({validationState: 'valid', isQuiet: true})
  )
  .add(
    'minValue = 0, maxValue = 20',
    () => render({minValue: 0, maxValue: 20})
  )
  .add(
    'minValue = -50, maxValue = -20',
    () => render({minValue: -50, maxValue: -20})
  )
  .add(
    'minValue = 20, maxValue = 50',
    () => render({minValue: 20, maxValue: 50})
  )
  .add(
    'minValue = 0, defaultValue = 0',
    () => render({minValue: 0, defaultValue: 0})
  )
  .add(
    'step = 5',
    () => render({step: 5})
  )
  .add(
    'step = 3 with min = 2, max = 20',
    () => render({step: 3, minValue: 2, maxValue: 20})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'showStepper = false',
    () => render({showStepper: false})
  )
  .add(
    'isQuiet, showStepper = false',
    () => render({isQuiet: true, showStepper: false})
  )
  .add(
    'required',
    () => render({isRequired: true})
  )
  .add(
    'optional',
    () => render({necessityIndicator: 'label'})
  )
  .add(
    'required with label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'controlled',
    () => <NumberFieldControlled />
  )
  .add(
    'currency switcher',
    () => <NumberFieldWithCurrencySelect />
  );

function render(props: any = {}) {
  return (
    <NumberField {...props} onChange={action('onChange')} UNSAFE_className="custom_classname" label="Enter numbers" />
  );
}

function NumberFieldControlled(props) {
  let [value, setValue] = useState(10);
  return <NumberField {...props} formatOptions={{style: 'currency', currency: 'EUR'}} value={value} onChange={chain(setValue, action('onChange'))} label="Enter numbers" />;
}

function NumberFieldWithCurrencySelect(props) {
  let [value, setValue] = useState(10);
  let [currency, setCurrency] = useState('EUR');
  let [currencySign, setCurrencySign] = useState('standard');
  return (
    <Form>
      <NumberField label="Monies" {...props} formatOptions={{style: 'currency', currency, currencySign}} value={value} onChange={chain(setValue, action('onChange'))} />
      <Picker
        onSelectionChange={item => setCurrency(String(item))}
        label="Choose Currency"
        defaultSelectedKey={currency}
        items={[{label: 'Euro', value: 'EUR'}, {label: 'US Dollar', value: 'USD'}, {label: 'Japanese Yen', value: 'JPY'}, {label: 'Saudi Riyal', value: 'SAR'}]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
      <Picker
        onSelectionChange={item => setCurrencySign(String(item))}
        label="Currency Sign"
        defaultSelectedKey={currencySign}
        items={[{label: 'Standard', value: 'standard'}, {label: 'Accounting', value: 'accounting'}]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
    </Form>
  );
}

class ErrorBoundary extends React.Component<{}, {hasError: boolean}> {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div>Your browser may not support this set of Intl.Format options.</div>;
    }

    return this.props.children;
  }
}
