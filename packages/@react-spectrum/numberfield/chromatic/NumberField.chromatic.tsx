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

import {classNames} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {mergeProps} from '@react-aria/utils';
import {Meta, StoryFn} from '@storybook/react';
import {NumberField} from '../src';
import React from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import stepperStyles from '@adobe/spectrum-css-temp/components/stepper/vars.css';

let states = [
  {isQuiet: true},
  {isDisabled: true},
  {isReadOnly: true},
  {hideStepper: true},
  {validationState: ['valid', 'invalid']},
  {contextualHelp: (
    <ContextualHelp>
      <Heading>What is a segment?</Heading>
      <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
    </ContextualHelp>
  )}
];

let noLabelStates = [
  {UNSAFE_className: classNames(
    {},
      classNames(stepperStyles, 'focus-ring')
    )},
  {UNSAFE_className: classNames(
      {},
      classNames(stepperStyles, 'is-focused')
    )}
];

let combinations = generatePowerset(states, v => v.contextualHelp && (v.validationState || v.hideStepper || v.isReadOnly));

let combinationsStyles: any[] = [...combinations];
for (let i = 0; i < noLabelStates.length; i++) {
  let len = combinationsStyles.length;
  for (let j = 0; j < len; j++) {
    let merged = mergeProps(combinationsStyles[j], noLabelStates[i]);

    combinationsStyles.push(merged);
  }
}
// doing this line inside the loop caused focus-ring to never be added
combinationsStyles = combinationsStyles.filter(
  combo => {
    // we only care about combos with class name state, the rest are covered in other stories
    let hasClassName = combo.UNSAFE_className;
    let invalidFocusState = (
      combo.UNSAFE_className
        && combo.UNSAFE_className.includes('focus-ring')
        && !combo.UNSAFE_className.includes('is-focused')
    );
    let invalidDisabledState = (
      combo.isDisabled
        && combo.UNSAFE_className
        && combo.UNSAFE_className.includes('is-focused')
    );
    return hasClassName && !invalidFocusState && !invalidDisabledState;
  }
);


function shortName(key, value) {
  let returnVal = '';
  switch (key) {
    case 'isQuiet':
      returnVal = 'quiet';
      break;
    case 'isDisabled':
      returnVal = 'disable';
      break;
    case 'isReadOnly':
      returnVal = 'ro';
      break;
    case 'hideStepper':
      returnVal = 'hidestep';
      break;
    case 'validationState':
      returnVal = `vs ${value}`;
      break;
    case 'UNSAFE_className':
      returnVal = `cn ${value.includes('focus-ring') ? 'ring' : 'focused'}`;
      break;
  }
  return returnVal;
}

const meta: Meta = {
  title: 'NumberField'
};

export default meta;

const Template: StoryFn<SpectrumNumberFieldProps> = (args) => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <NumberField key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} />;
    })}
  </Grid>
);

const TemplateVertical: StoryFn<SpectrumNumberFieldProps> = (args) => (
  <Grid autoFlow="row" gap="size-300">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <NumberField key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} />;
    })}
  </Grid>
);

const TemplateSmall: StoryFn<SpectrumNumberFieldProps> = (args) => (
  <Grid columns={repeat(4, '1fr')} autoFlow="row" gap="size-200">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <NumberField key={key} {...args} {...c} label={args['aria-label'] ? undefined : key} />;
    })}
  </Grid>
);

const TemplateWithForcedStyles: StoryFn<SpectrumNumberFieldProps> = (args) => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinationsStyles.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      return <div key={key}><div>{key}</div><NumberField {...args} {...c} /></div>;
    })}
  </Grid>
);

export const PropDefaults = {
  render: Template,
  name: 'default',
  args: {}
};

export const PropDefaultValue = {
  render: Template,
  name: 'default value',
  args: {...PropDefaults.args, defaultValue: 10}
};

export const PropValue = {
  render: Template,
  name: 'value',
  args: {...PropDefaults.args, value: 10}
};

export const PropValueMobileViewport = {
  render: TemplateVertical,
  name: 'value, mobile viewport',
  args: {...PropDefaults.args, value: 10},

  parameters: {
    chromatic: {viewports: [320]},
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['large'],
      disableAnimations: true
    }
  }
};

export const PropAriaLabelled = {
  render: Template,
  name: 'aria-label',
  args: {'aria-label': 'Label'}
};

export const PropLabelEnd = {
  render: Template,
  name: 'label end',
  args: {...PropDefaults.args, labelAlign: 'end', defaultValue: 10}
};

export const PropMinValue = {
  render: Template,
  name: 'min value',
  args: {...PropDefaults.args, minValue: 10, defaultValue: 10}
};

export const PropMaxValue = {
  render: Template,
  name: 'max value',
  args: {...PropDefaults.args, maxValue: 10, defaultValue: 10}
};

export const PropLabelSide = {
  render: TemplateSmall,
  name: 'label side',
  args: {...PropDefaults.args, labelPosition: 'side', defaultValue: 10}
};

export const PropCustomWidth = {
  render: TemplateSmall,
  name: 'custom width',
  args: {...PropDefaults.args, width: 'size-3000'}
};

export const PropInteractionStyles = {
  render: TemplateWithForcedStyles,
  name: 'interaction styles',
  args: {...PropAriaLabelled.args}
};

export const PropInteractionStylesMinValue = {
  render: TemplateWithForcedStyles,
  name: 'interaction styles min value',
  args: {...PropAriaLabelled.args, minValue: 10, defaultValue: 10}
};
