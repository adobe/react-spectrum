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
import {Grid, repeat} from '@react-spectrum/layout';
import inputStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {mergeProps} from '@react-aria/utils';
import {Meta, Story} from '@storybook/react';
import {NumberField} from '../src';
import React from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import stepperStyles from '@adobe/spectrum-css-temp/components/stepper/vars.css';

let states = [
  {isQuiet: true},
  {isDisabled: true},
  {isReadOnly: true},
  {hideStepper: true},
  {validationState: ['valid', 'invalid', undefined]}
];

let noLabelStates = [
  {UNSAFE_className: classNames(
    {},
      classNames(inputStyles, 'focus-ring'),
      classNames(stepperStyles, 'focus-ring')
    )},
  {UNSAFE_className: classNames(
      {},
      classNames(stepperStyles, 'is-focused')
    )}
];

// Generate a powerset of the options
let combinations: any[] = [{}];
for (let i = 0; i < states.length; i++) {
  let len = combinations.length;
  for (let j = 0; j < len; j++) {
    if (states[i].validationState) {
      states[i].validationState.forEach(state => {
        let merged = mergeProps(combinations[j], {validationState: state});
        combinations.push(merged);
      });
    } else {
      let merged = mergeProps(combinations[j], states[i]);
      combinations.push(merged);
    }
  }
}

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
      returnVal = `vs ${value === undefined ? 'none' : value}`;
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

const Template: Story<SpectrumNumberFieldProps> = (args) => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map(c => {
      let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
      if (!key) {
        key = 'empty';
      }
      return <NumberField key={key} {...args} {...c} label={key} />;
    })}
  </Grid>
);

// const TemplateWithForcedStyles: Story<SpectrumNumberFieldProps> = (args) => (
//   <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
//     {combinationsStyles.map(c => {
//       let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
//       return <div key={key}><div>{key}</div><NumberField {...args} {...c} /></div>;
//     })}
//   </Grid>
// );

export const PropDefaults = Template.bind({});
PropDefaults.storyName = 'default';
PropDefaults.args = {};

export const PropDefaultValue = Template.bind({});
PropDefaultValue.storyName = 'default value';
PropDefaultValue.args = {...PropDefaults.args, defaultValue: 10};

export const PropValue = Template.bind({});
PropValue.storyName = 'value';
PropValue.args = {...PropDefaults.args, value: 10};

export const PropAriaLabelled = Template.bind({});
PropAriaLabelled.storyName = 'aria-label';
PropAriaLabelled.args = {'aria-label': 'Label'};

export const PropLabelEnd = Template.bind({});
PropLabelEnd.storyName = 'label end';
PropLabelEnd.args = {...PropDefaults.args, labelAlign: 'end', defaultValue: 10};

export const PropLabelSide = Template.bind({});
PropLabelSide.storyName = 'label side';
PropLabelSide.args = {...PropDefaults.args, labelPosition: 'side', defaultValue: 10};

export const PropCustomWidth = Template.bind({});
PropCustomWidth.storyName = 'custom width';
PropCustomWidth.args = {...PropDefaults.args, width: 'size-3000'};

// we can only force the interaction styles on the no visible label stories
// TODO refactor CSS so all states are top level, otherwise we can't do this one
// export const PropInteractionStyles = TemplateWithForcedStyles.bind({});
// PropInteractionStyles.storyName = 'interaction styles';
// PropInteractionStyles.args = {...PropAriaLabelled.args};
