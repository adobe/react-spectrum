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
import {Button} from '@react-spectrum/button';
import {chain} from '@react-aria/utils';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Heading} from '@react-spectrum/text';
import {Item, Picker} from '@react-spectrum/picker';
import {Meta, StoryFn} from '@storybook/react';
import {NumberField, SpectrumNumberFieldProps} from '../src';
import React, {ReactNode, useState} from 'react';

export default {
  title: 'NumberField',
  decorators: [(story) => <ErrorBoundary>{story()}</ErrorBoundary>],
  providerSwitcher: {status: 'notice'}
} as Meta<SpectrumNumberFieldProps>;

export type NumberFieldStory = StoryFn<SpectrumNumberFieldProps>;

export const Default: NumberFieldStory = () => render({});

Default.story = {
  name: 'default'
};

export const DefaultValue10: NumberFieldStory = () => render({defaultValue: 10});

DefaultValue10.story = {
  name: 'defaultValue: 10'
};

export const Value10: NumberFieldStory = () => render({value: 10});

Value10.story = {
  name: 'value: 10'
};

export const MaximumFractionDigits0: NumberFieldStory = () => render({formatOptions: {maximumFractionDigits: 0}});

MaximumFractionDigits0.story = {
  name: 'maximumFractionDigits = 0'
};

export const Currency: NumberFieldStory = () =>
  render({formatOptions: {style: 'currency', currency: 'EUR'}, label: 'Price'});

Currency.story = {
  name: 'currency'
};

export const Percent: NumberFieldStory = () => render({formatOptions: {style: 'percent'}, label: 'Tax'});

Percent.story = {
  name: 'percent'
};

export const PercentMaxFractionDigits2NoMinFractionDigits: NumberFieldStory = () =>
  render({formatOptions: {style: 'percent', maximumFractionDigits: 2}, label: 'Tax'});

PercentMaxFractionDigits2NoMinFractionDigits.story = {
  name: 'percent, max fraction digits: 2, no min fraction digits'
};

export const PercentMin2Max2FractionDigits: NumberFieldStory = () =>
  render({
    formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2},
    label: 'Tax'
  });

PercentMin2Max2FractionDigits.story = {
  name: 'percent min = 2 max = 2 fraction digits'
};

export const PercentMin2Max3FractionDigits: NumberFieldStory = () =>
  render({
    formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 3},
    label: 'Tax'
  });

PercentMin2Max3FractionDigits.story = {
  name: 'percent min = 2 max = 3 fraction digits'
};

export const MinValue00FractionDigits: NumberFieldStory = () =>
  render({minValue: 0, formatOptions: {maximumFractionDigits: 0}});

MinValue00FractionDigits.story = {
  name: 'minValue = 0, 0 fraction digits'
};

export const PercentUsingSign: NumberFieldStory = () =>
  render({formatOptions: {style: 'percent', signDisplay: 'always'}, label: 'Tax'});

PercentUsingSign.story = {
  name: 'percent using sign'
};

export const Disabled: NumberFieldStory = () => render({isDisabled: true});

Disabled.story = {
  name: 'disabled'
};

export const Readonly: NumberFieldStory = () => render({defaultValue: 10, isReadOnly: true});

Readonly.story = {
  name: 'readonly'
};

export const IsQuiet: NumberFieldStory = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const QuietDisabled: NumberFieldStory = () => render({isQuiet: true, isDisabled: true, defaultValue: 10});

QuietDisabled.story = {
  name: 'quiet disabled'
};

export const QuietReadonly: NumberFieldStory = () => render({isQuiet: true, isReadOnly: true, defaultValue: 10});

QuietReadonly.story = {
  name: 'quiet readonly'
};

export const ValidationStateInvalid: NumberFieldStory = () => render({validationState: 'invalid'});

ValidationStateInvalid.story = {
  name: 'validationState: invalid'
};

export const ValidationStateValid: NumberFieldStory = () => render({validationState: 'valid'});

ValidationStateValid.story = {
  name: 'validationState: valid'
};

export const ValidationStateInvalidIsQuiet: NumberFieldStory = () =>
  render({validationState: 'invalid', isQuiet: true});

ValidationStateInvalidIsQuiet.story = {
  name: 'validationState: invalid, isQuiet'
};

export const ValidationStateValidIsQuiet: NumberFieldStory = () =>
  render({validationState: 'valid', isQuiet: true});

ValidationStateValidIsQuiet.story = {
  name: 'validationState: valid, isQuiet'
};

export const MinValue0MaxValue20: NumberFieldStory = () => render({minValue: 0, maxValue: 20});

MinValue0MaxValue20.story = {
  name: 'minValue = 0, maxValue = 20'
};

export const MinValue0MaxValue20Quiet: NumberFieldStory = () => render({isQuiet: true, minValue: 0, maxValue: 20});

MinValue0MaxValue20Quiet.story = {
  name: 'minValue = 0, maxValue = 20, quiet'
};

export const MinValue50MaxValue20: NumberFieldStory = () => render({minValue: -50, maxValue: -20});

MinValue50MaxValue20.story = {
  name: 'minValue = -50, maxValue = -20'
};

export const MinValue20MaxValue50: NumberFieldStory = () => render({minValue: 20, maxValue: 50});

MinValue20MaxValue50.story = {
  name: 'minValue = 20, maxValue = 50'
};

export const MinValue0DefaultValue0: NumberFieldStory = () => render({minValue: 0, defaultValue: 0});

MinValue0DefaultValue0.story = {
  name: 'minValue = 0, defaultValue = 0'
};

export const Step5: NumberFieldStory = () => render({step: 5});

Step5.story = {
  name: 'step = 5'
};

export const Step3WithMin2Max21: NumberFieldStory = () => render({step: 3, minValue: 2, maxValue: 21});

Step3WithMin2Max21.story = {
  name: 'step = 3 with min = 2, max = 21'
};

export const AutoFocus: NumberFieldStory = () => render({autoFocus: true});

AutoFocus.story = {
  name: 'autoFocus'
};

export const HideStepper: NumberFieldStory = () => render({hideStepper: true});

HideStepper.story = {
  name: 'hideStepper'
};

export const IsQuietHideStepper: NumberFieldStory = () => render({isQuiet: true, hideStepper: true});

IsQuietHideStepper.story = {
  name: 'isQuiet, hideStepper'
};

export const Required: NumberFieldStory = () => render({isRequired: true});

Required.story = {
  name: 'required'
};

export const Optional: NumberFieldStory = () => render({necessityIndicator: 'label'});

Optional.story = {
  name: 'optional'
};

export const RequiredWithLabel: NumberFieldStory = () => render({isRequired: true, necessityIndicator: 'label'});

RequiredWithLabel.story = {
  name: 'required with label'
};

export const LabelTopEnd: NumberFieldStory = () =>
  render({isRequired: true, labelPosition: 'top', labelAlign: 'end'});

LabelTopEnd.story = {
  name: 'label top end'
};

export const LabelSide: NumberFieldStory = () => render({isRequired: true, labelPosition: 'side'});

LabelSide.story = {
  name: 'label side'
};

export const NoVisibleLabel: NumberFieldStory = () => renderNoLabel({isRequired: true, 'aria-label': 'Width'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const QuietNoVisibleLabel: NumberFieldStory = () =>
  renderNoLabel({isQuiet: true, isRequired: true, 'aria-label': 'Width'});

QuietNoVisibleLabel.story = {
  name: 'quiet no visible label'
};

export const QuietNoVisibleLabelHidestepper: NumberFieldStory = () =>
  renderNoLabel({hideStepper: true, isQuiet: true, isRequired: true, 'aria-label': 'Width'});

QuietNoVisibleLabelHidestepper.story = {
  name: 'quiet no visible label hidestepper'
};

export const AriaLabelledby: NumberFieldStory = () => (
  <>
    <label htmlFor="numberfield" id="label">
      Width
    </label>
    {renderNoLabel({isRequired: true, id: 'numberfield', 'aria-labelledby': 'label'})}
  </>
);

AriaLabelledby.story = {
  name: 'aria-labelledby'
};

export const WithDescriptionNoVisibleLabel: NumberFieldStory = () =>
  renderNoLabel({'aria-label': 'Age', description: 'Please select your age.'});

WithDescriptionNoVisibleLabel.story = {
  name: 'with description, no visible label'
};

export const WithErrorMessageLabelPositionSide: NumberFieldStory = () =>
  render({
    labelPosition: 'side',
    errorMessage: 'Please enter a positive number.',
    validationState: 'invalid'
  });

WithErrorMessageLabelPositionSide.story = {
  name: 'with error message, labelPosition: side'
};

export const _ContextualHelp: NumberFieldStory = () =>
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
  });

_ContextualHelp.story = {
  name: 'contextual help'
};

export const CustomWidth: NumberFieldStory = () => render({width: 'size-3000'});

CustomWidth.story = {
  name: 'custom width'
};

export const QuietCustomWidth: NumberFieldStory = () => render({isQuiet: true, width: 'size-3000'});

QuietCustomWidth.story = {
  name: 'quiet custom width'
};

export const CustomWidthNoVisibleLabel: NumberFieldStory = () =>
  renderNoLabel({width: 'size-3000', isRequired: true, 'aria-label': 'Width'});

CustomWidthNoVisibleLabel.story = {
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide: NumberFieldStory = () =>
  render({width: 'size-3000', labelPosition: 'side'});

CustomWidthLabelPositionSide.story = {
  name: 'custom width, labelPosition=side'
};

export const Controlled: NumberFieldStory = () => <NumberFieldControlled />;

Controlled.story = {
  name: 'controlled'
};

export const CurrencySwitcher: NumberFieldStory = () => <NumberFieldWithCurrencySelect />;

CurrencySwitcher.story = {
  name: 'currency switcher'
};

export const Flexed: NumberFieldStory = () => renderSet();

Flexed.story = {
  name: 'flexed'
};

export const MinWidth: NumberFieldStory = () => render({width: 0});

MinWidth.story = {
  name: 'min width'
};

export const FocusEvents: NumberFieldStory = () =>
  render({
    onBlur: action('onBlur'),
    onFocus: action('onFocus'),
    onFocusChange: action('onFocusChange'),
    onKeyDown: action('onKeyDown'),
    onKeyUp: action('onKeyUp')
  });

FocusEvents.story = {
  name: 'focus events'
};

export const InputDomEvents: NumberFieldStory = () =>
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
  });

InputDomEvents.story = {
  name: 'input dom events'
};

export const ResetControlledStateToBlankWithNull: NumberFieldStory = () => <NumberFieldControlledStateReset />;

ResetControlledStateToBlankWithNull.story = {
  name: 'reset controlled state to blank with null'
};

function render(props: any = {}) {
  return (
    <NumberField onChange={action('onChange')} UNSAFE_className="custom_classname" label="Width" {...props} />
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
  return <NumberField {...props} formatOptions={{style: 'currency', currency: 'EUR'}} value={value} onChange={chain(setValue, action('onChange'))} label="Price" />;
}

function NumberFieldWithCurrencySelect(props) {
  let [value, setValue] = useState(10);
  let [currency, setCurrency] = useState('EUR');
  let [currencySign, setCurrencySign] = useState('standard');
  let [currencyDisplay, setCurrencyDisplay] = useState('symbol');
  return (
    <Form>
      <NumberField label="Price" {...props} formatOptions={{style: 'currency', currency, currencySign, currencyDisplay}} value={value} onChange={chain(setValue, action('onChange'))} />
      <Picker
        onSelectionChange={item => setCurrency(String(item))}
        label="Choose Currency"
        selectedKey={currency}
        items={[{label: 'Euro', value: 'EUR'}, {label: 'US Dollar', value: 'USD'}, {label: 'Japanese Yen', value: 'JPY'}, {label: 'Saudi Riyal', value: 'SAR'}]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
      <Picker
        onSelectionChange={item => setCurrencySign(String(item))}
        label="Currency Sign"
        selectedKey={currencySign}
        items={[{label: 'Standard', value: 'standard'}, {label: 'Accounting', value: 'accounting'}]}>
        {item => <Item key={item.value}>{item.label}</Item>}
      </Picker>
      <Picker
        onSelectionChange={item => setCurrencyDisplay(String(item))}
        label="Currency Display"
        selectedKey={currencyDisplay}
        items={[{label: 'Symbol', value: 'symbol'}, {label: 'Narrow Symbol', value: 'narrowSymbol'}, {label: 'Code', value: 'code'}, {label: 'Name', value: 'name'}]}>
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
        onChange={(value) => setControlledValue(value)} />
      <Button
        variant={'primary'}
        onPress={() => setControlledValue(NaN)}>
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
