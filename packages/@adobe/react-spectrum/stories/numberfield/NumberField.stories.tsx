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

import {action} from 'storybook/actions';
import {Button} from '../../src/button/Button';
import {chain} from 'react-aria/chain';
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Flex} from '../../src/layout/Flex';
import {Form} from '../../src/form/Form';
import {Heading} from '../../src/text/Heading';
import {Item} from 'react-stately/Item';
import {Meta, StoryObj} from '@storybook/react';
import {NumberField, SpectrumNumberFieldProps} from '../../src/numberfield/NumberField';
import {Picker} from '../../src/picker/Picker';
import React, {ReactNode, useState} from 'react';

export default {
  title: 'NumberField',
  decorators: [story => <ErrorBoundary>{story()}</ErrorBoundary>],
  providerSwitcher: {status: 'notice'}
} as Meta<SpectrumNumberFieldProps>;

export type NumberFieldStory = StoryObj<SpectrumNumberFieldProps>;

export const Default: NumberFieldStory = {
  render: () => render({}),
  name: 'default'
};

export const DefaultValue10: NumberFieldStory = {
  render: () => render({defaultValue: 10}),
  name: 'defaultValue: 10'
};

export const Value10: NumberFieldStory = {
  render: () => render({value: 10}),
  name: 'value: 10'
};

export const MaximumFractionDigits0: NumberFieldStory = {
  render: () => render({formatOptions: {maximumFractionDigits: 0}}),
  name: 'maximumFractionDigits = 0'
};

export const Currency: NumberFieldStory = {
  render: () => render({formatOptions: {style: 'currency', currency: 'EUR'}, label: 'Price'}),
  name: 'currency'
};

export const Percent: NumberFieldStory = {
  render: () => render({formatOptions: {style: 'percent'}, label: 'Tax'}),
  name: 'percent'
};

export const PercentMaxFractionDigits2NoMinFractionDigits: NumberFieldStory = {
  render: () => render({formatOptions: {style: 'percent', maximumFractionDigits: 2}, label: 'Tax'}),
  name: 'percent, max fraction digits: 2, no min fraction digits'
};

export const PercentMin2Max2FractionDigits: NumberFieldStory = {
  render: () =>
    render({
      formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2},
      label: 'Tax'
    }),
  name: 'percent min = 2 max = 2 fraction digits'
};

export const PercentMin2Max3FractionDigits: NumberFieldStory = {
  render: () =>
    render({
      formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 3},
      label: 'Tax'
    }),
  name: 'percent min = 2 max = 3 fraction digits'
};

export const MinValue00FractionDigits: NumberFieldStory = {
  render: () => render({minValue: 0, formatOptions: {maximumFractionDigits: 0}}),
  name: 'minValue = 0, 0 fraction digits'
};

export const PercentUsingSign: NumberFieldStory = {
  render: () => render({formatOptions: {style: 'percent', signDisplay: 'always'}, label: 'Tax'}),
  name: 'percent using sign'
};

export const Disabled: NumberFieldStory = {
  render: () => render({isDisabled: true}),
  name: 'disabled'
};

export const Readonly: NumberFieldStory = {
  render: () => render({defaultValue: 10, isReadOnly: true}),
  name: 'readonly'
};

export const IsQuiet: NumberFieldStory = {
  render: () => render({isQuiet: true}),
  name: 'isQuiet'
};

export const QuietDisabled: NumberFieldStory = {
  render: () => render({isQuiet: true, isDisabled: true, defaultValue: 10}),
  name: 'quiet disabled'
};

export const QuietReadonly: NumberFieldStory = {
  render: () => render({isQuiet: true, isReadOnly: true, defaultValue: 10}),
  name: 'quiet readonly'
};

export const ValidationStateInvalid: NumberFieldStory = {
  render: () => render({validationState: 'invalid'}),
  name: 'validationState: invalid'
};

export const ValidationStateValid: NumberFieldStory = {
  render: () => render({validationState: 'valid'}),
  name: 'validationState: valid'
};

export const ValidationStateInvalidIsQuiet: NumberFieldStory = {
  render: () => render({validationState: 'invalid', isQuiet: true}),
  name: 'validationState: invalid, isQuiet'
};

export const ValidationStateValidIsQuiet: NumberFieldStory = {
  render: () => render({validationState: 'valid', isQuiet: true}),
  name: 'validationState: valid, isQuiet'
};

export const MinValue0MaxValue20: NumberFieldStory = {
  render: () => render({minValue: 0, maxValue: 20}),
  name: 'minValue = 0, maxValue = 20'
};

export const MinValue0MaxValue20Quiet: NumberFieldStory = {
  render: () => render({isQuiet: true, minValue: 0, maxValue: 20}),
  name: 'minValue = 0, maxValue = 20, quiet'
};

export const MinValue50MaxValue20: NumberFieldStory = {
  render: () => render({minValue: -50, maxValue: -20}),
  name: 'minValue = -50, maxValue = -20'
};

export const MinValue20MaxValue50: NumberFieldStory = {
  render: () => render({minValue: 20, maxValue: 50}),
  name: 'minValue = 20, maxValue = 50'
};

export const MinValue0DefaultValue0: NumberFieldStory = {
  render: () => render({minValue: 0, defaultValue: 0}),
  name: 'minValue = 0, defaultValue = 0'
};

export const Step5: NumberFieldStory = {
  render: () => render({step: 5}),
  name: 'step = 5'
};

export const Step3WithMin2Max21: NumberFieldStory = {
  render: () => render({step: 3, minValue: 2, maxValue: 21}),
  name: 'step = 3 with min = 2, max = 21'
};

export const InteractOutsideBehaviorNone: NumberFieldStory = {
  render: () => render({step: 3, minValue: 2, maxValue: 21, commitBehavior: 'validate'}),
  name: 'commitBehavior = validate'
};

export const AutoFocus: NumberFieldStory = {
  render: () => render({autoFocus: true}),
  name: 'autoFocus'
};

export const HideStepper: NumberFieldStory = {
  render: () => render({hideStepper: true}),
  name: 'hideStepper'
};

export const IsQuietHideStepper: NumberFieldStory = {
  render: () => render({isQuiet: true, hideStepper: true}),
  name: 'isQuiet, hideStepper'
};

export const Required: NumberFieldStory = {
  render: () => render({isRequired: true}),
  name: 'required'
};

export const Optional: NumberFieldStory = {
  render: () => render({necessityIndicator: 'label'}),
  name: 'optional'
};

export const RequiredWithLabel: NumberFieldStory = {
  render: () => render({isRequired: true, necessityIndicator: 'label'}),
  name: 'required with label'
};

export const LabelTopEnd: NumberFieldStory = {
  render: () => render({isRequired: true, labelPosition: 'top', labelAlign: 'end'}),
  name: 'label top end'
};

export const LabelSide: NumberFieldStory = {
  render: () => render({isRequired: true, labelPosition: 'side'}),
  name: 'label side'
};

export const NoVisibleLabel: NumberFieldStory = {
  render: () => renderNoLabel({isRequired: true, 'aria-label': 'Width'}),
  name: 'no visible label'
};

export const QuietNoVisibleLabel: NumberFieldStory = {
  render: () => renderNoLabel({isQuiet: true, isRequired: true, 'aria-label': 'Width'}),
  name: 'quiet no visible label'
};

export const QuietNoVisibleLabelHidestepper: NumberFieldStory = {
  render: () =>
    renderNoLabel({hideStepper: true, isQuiet: true, isRequired: true, 'aria-label': 'Width'}),
  name: 'quiet no visible label hidestepper'
};

export const AriaLabelledby: NumberFieldStory = {
  render: () => (
    <>
      <label htmlFor="numberfield" id="label">
        Width
      </label>
      {renderNoLabel({isRequired: true, id: 'numberfield', 'aria-labelledby': 'label'})}
    </>
  ),
  name: 'aria-labelledby'
};

export const WithDescriptionNoVisibleLabel: NumberFieldStory = {
  render: () => renderNoLabel({'aria-label': 'Age', description: 'Please select your age.'}),
  name: 'with description, no visible label'
};

export const WithErrorMessageLabelPositionSide: NumberFieldStory = {
  render: () =>
    render({
      labelPosition: 'side',
      errorMessage: 'Please enter a positive number.',
      validationState: 'invalid'
    }),
  name: 'with error message, labelPosition: side'
};

export const _ContextualHelp: NumberFieldStory = {
  render: () =>
    render({
      contextualHelp: (
        <ContextualHelp>
          <Heading>What is a segment?</Heading>
          <Content>
            Segments identify who your visitors are, what devices and services they use, where they
            navigated from, and much more.
          </Content>
        </ContextualHelp>
      )
    }),
  name: 'contextual help'
};

export const CustomWidth: NumberFieldStory = {
  render: () => render({width: 'size-3000'}),
  name: 'custom width'
};

export const QuietCustomWidth: NumberFieldStory = {
  render: () => render({isQuiet: true, width: 'size-3000'}),
  name: 'quiet custom width'
};

export const CustomWidthNoVisibleLabel: NumberFieldStory = {
  render: () => renderNoLabel({width: 'size-3000', isRequired: true, 'aria-label': 'Width'}),
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide: NumberFieldStory = {
  render: () => render({width: 'size-3000', labelPosition: 'side'}),
  name: 'custom width, labelPosition=side'
};

export const Controlled: NumberFieldStory = {
  render: () => <NumberFieldControlled />,
  name: 'controlled'
};

export const CurrencySwitcher: NumberFieldStory = {
  render: () => <NumberFieldWithCurrencySelect />,
  name: 'currency switcher'
};

export const Flexed: NumberFieldStory = {
  render: () => renderSet(),
  name: 'flexed'
};

export const MinWidth: NumberFieldStory = {
  render: () => render({width: 0}),
  name: 'min width'
};

export const FocusEvents: NumberFieldStory = {
  render: () =>
    render({
      onBlur: action('onBlur'),
      onFocus: action('onFocus'),
      onFocusChange: action('onFocusChange'),
      onKeyDown: action('onKeyDown'),
      onKeyUp: action('onKeyUp')
    }),
  name: 'focus events'
};

export const InputDomEvents: NumberFieldStory = {
  render: () =>
    render({
      onCopy: action('onCopy'),
      onCut: action('onCut'),
      onPaste: action('onPaste'),
      onCompositionStart: action('onCompositionStart'),
      onCompositionEnd: action('onCompositionEnd'),
      onCompositionUpdate: action('onCompositionUpdate'),
      onSelect: action('onSelect'),
      onBeforeInput: action('onBeforeInput'),
      onInput: action('onInput')
    }),
  name: 'input dom events'
};

export const ResetControlledStateToBlankWithNull: NumberFieldStory = {
  render: () => <NumberFieldControlledStateReset />,
  name: 'reset controlled state to blank with null'
};

function render(props: any = {}) {
  return (
    <NumberField
      onChange={action('onChange')}
      UNSAFE_className="custom_classname"
      label="Width"
      {...props}
    />
  );
}

function renderNoLabel(props: any = {}) {
  return (
    <NumberField {...props} onChange={action('onChange')} UNSAFE_className="custom_classname" />
  );
}

function renderSet() {
  return (
    <Flex width="100%" gap="size-200" alignItems="end">
      <NumberField label="Grows" flexGrow={1} />
      <NumberField label="Static" />
      <NumberField aria-label="Grows" flexGrow={1} />
      <NumberField aria-label="Static" />
    </Flex>
  );
}

function NumberFieldControlled(props) {
  let [value, setValue] = useState(10);
  return (
    <NumberField
      {...props}
      formatOptions={{style: 'currency', currency: 'EUR'}}
      value={value}
      onChange={chain(setValue, action('onChange'))}
      label="Price"
    />
  );
}

function NumberFieldWithCurrencySelect(props) {
  let [value, setValue] = useState(10);
  let [currency, setCurrency] = useState('EUR');
  let [currencySign, setCurrencySign] = useState('standard');
  let [currencyDisplay, setCurrencyDisplay] = useState('symbol');
  return (
    <Form>
      <NumberField
        label="Price"
        {...props}
        formatOptions={{style: 'currency', currency, currencySign, currencyDisplay}}
        value={value}
        onChange={chain(setValue, action('onChange'))}
      />
      <Picker
        onSelectionChange={item => setCurrency(String(item))}
        label="Choose Currency"
        selectedKey={currency}
        items={[
          {label: 'Euro', value: 'EUR'},
          {label: 'US Dollar', value: 'USD'},
          {label: 'Japanese Yen', value: 'JPY'},
          {label: 'Saudi Riyal', value: 'SAR'}
        ]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
      <Picker
        onSelectionChange={item => setCurrencySign(String(item))}
        label="Currency Sign"
        selectedKey={currencySign}
        items={[
          {label: 'Standard', value: 'standard'},
          {label: 'Accounting', value: 'accounting'}
        ]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
      <Picker
        onSelectionChange={item => setCurrencyDisplay(String(item))}
        label="Currency Display"
        selectedKey={currencyDisplay}
        items={[
          {label: 'Symbol', value: 'symbol'},
          {label: 'Narrow Symbol', value: 'narrowSymbol'},
          {label: 'Code', value: 'code'},
          {label: 'Name', value: 'name'}
        ]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
    </Form>
  );
}

function NumberFieldControlledStateReset() {
  const [controlledValue, setControlledValue] = useState(12);
  return (
    <>
      <NumberField
        aria-label="numberfield to reset"
        value={controlledValue}
        onChange={value => setControlledValue(value)}
      />
      <Button variant={'primary'} onPress={() => setControlledValue(NaN)}>
        Reset
      </Button>
    </>
  );
}

class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
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
