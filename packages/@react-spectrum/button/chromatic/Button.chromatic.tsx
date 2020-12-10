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

import Bell from '@spectrum-icons/workflow/src/Bell';
import {Button} from '../';
import * as Buttons from '../stories/Button.stories';
import {classNames} from '@react-spectrum/utils';
import {Grid, repeat} from '@react-spectrum/layout';
import {mergeProps} from '@react-aria/utils';
import {Meta, Story} from '@storybook/react';
import React, {ElementType} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';

const meta: Meta<SpectrumButtonProps> = {
  title: 'Button',
  component: Button,
  parameters: {
    providerSwitcher: {status: 'positive'},
    actions: {argTypesRegex: '^on.*'}
  }
};

export default meta;

let states = [
  {isQuiet: true},
  {isDisabled: true},
  {UNSAFE_className: classNames(styles, 'is-active')},
  {UNSAFE_className: classNames(styles, 'is-hovered')},
  {UNSAFE_className: classNames(styles, 'focus-ring')}
];

// Generate a powerset of the options
let combinations: any[] = [{}];
for (let i = 0; i < states.length; i++) {
  let len = combinations.length;
  for (let j = 0; j < len; j++) {
    let merged = mergeProps(combinations[j], states[i]);

    // Ignore disabled combined with focus states because that should be an impossible state
    // keep other combinations though so we know if the CSS is applied correctly
    if (merged.isDisabled && merged.UNSAFE_className && merged.UNSAFE_className.includes('focus-ring')) {
      continue;
    }

    combinations.push(merged);
  }
}

const Template = <T extends ElementType = 'button'>(): Story<SpectrumButtonProps<T>> => (args) => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map(c => <Button {...args} {...c} />)}
  </Grid>
);
const BackgroundTemplate = <T extends ElementType = 'button'>(): Story<SpectrumButtonProps<T>> => (args) => (
  <div  style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
    <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
      {combinations.map(c => <Button {...args} {...c} />)}
    </Grid>
  </div>
);


export const CTAButton = Template().bind({});
CTAButton.storyName = 'variant: cta';
CTAButton.args = Buttons.CTAButton.args;
export const PrimaryButton = Template().bind({});
PrimaryButton.storyName = 'variant: primary';
PrimaryButton.args = Buttons.PrimaryButton.args;
export const SecondaryButton = Template().bind({});
SecondaryButton.storyName = 'variant: secondary';
SecondaryButton.args = Buttons.SecondaryButton.args;
export const OverBackGroundButton = BackgroundTemplate().bind({});
OverBackGroundButton.storyName = 'variant: overBackground';
OverBackGroundButton.args = Buttons.OverBackGroundButton.args;
export const NegativeButton = Template().bind({});
NegativeButton.storyName = 'variant: negative';
NegativeButton.args = Buttons.NegativeButton.args;

export const DoubleTextNode = Template().bind({});
DoubleTextNode.storyName = 'double text node';
DoubleTextNode.args = {...Buttons.PrimaryButton.args, children: [0, ' Dogs']};

export const WithTextCTAButton = Template<'button'>().bind({});
WithTextCTAButton.storyName = 'with text cta button';
WithTextCTAButton.args = {...CTAButton.args, children: <Text>Default</Text>};
export const WithTextPrimaryButton = Template<'button'>().bind({});
WithTextPrimaryButton.storyName = 'with text primary button';
WithTextPrimaryButton.args = {...PrimaryButton.args, children: <Text>Default</Text>};
export const WithTextSecondaryButton = Template<'button'>().bind({});
WithTextSecondaryButton.storyName = 'with text secondary button';
WithTextSecondaryButton.args = {...SecondaryButton.args, children: <Text>Default</Text>};
export const WithTextOverBackGroundButton = BackgroundTemplate<'button'>().bind({});
WithTextOverBackGroundButton.storyName = 'with text overBackground button';
WithTextOverBackGroundButton.args = {...OverBackGroundButton.args, children: <Text>Default</Text>};
export const WithTextNegativeButton = Template<'button'>().bind({});
WithTextNegativeButton.storyName = 'with text negative button';
WithTextNegativeButton.args = {...NegativeButton.args, children: <Text>Default</Text>};


export const WithIconCTAButton = Template<'button'>().bind({});
WithIconCTAButton.storyName = 'with icon cta button';
WithIconCTAButton.args = {...CTAButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconPrimaryButton = Template<'button'>().bind({});
WithIconPrimaryButton.storyName = 'with icon primary button';
WithIconPrimaryButton.args = {...PrimaryButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconSecondaryButton = Template<'button'>().bind({});
WithIconSecondaryButton.storyName = 'with icon secondary button';
WithIconSecondaryButton.args = {...SecondaryButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconOverBackGroundButton = BackgroundTemplate<'button'>().bind({});
WithIconOverBackGroundButton.storyName = 'with icon overBackground button';
WithIconOverBackGroundButton.args = {...OverBackGroundButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconNegativeButton = Template<'button'>().bind({});
WithIconNegativeButton.storyName = 'with icon negative button';
WithIconNegativeButton.args = {...NegativeButton.args, children: <Bell />, 'aria-label': 'Default'};


export const WithBothCTAButton = Template<'button'>().bind({});
WithBothCTAButton.storyName = 'with both cta button';
WithBothCTAButton.args = {...CTAButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothPrimaryButton = Template<'button'>().bind({});
WithBothPrimaryButton.storyName = 'with both primary button';
WithBothPrimaryButton.args = {...PrimaryButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothSecondaryButton = Template<'button'>().bind({});
WithBothSecondaryButton.storyName = 'with both secondary button';
WithBothSecondaryButton.args = {...SecondaryButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothOverBackGroundButton = BackgroundTemplate<'button'>().bind({});
WithBothOverBackGroundButton.storyName = 'with both overBackground button';
WithBothOverBackGroundButton.args = {...OverBackGroundButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothNegativeButton = Template<'button'>().bind({});
WithBothNegativeButton.storyName = 'with both negative button';
WithBothNegativeButton.args = {...NegativeButton.args, children: <><Bell /><Text>Default</Text></>};


export const LinkCTAButton = Template<'a'>().bind({});
LinkCTAButton.storyName = 'link cta button';
LinkCTAButton.args = {variant: 'cta', elementType: 'a', href: '//example.com', target: '_self', children: <><Bell /><Text>Default</Text></>};
export const LinkPrimaryButton = Template<'a'>().bind({});
LinkPrimaryButton.storyName = 'link primary button';
LinkPrimaryButton.args = {...LinkCTAButton.args, variant: 'primary'};
export const LinkSecondaryButton = Template<'a'>().bind({});
LinkSecondaryButton.storyName = 'link secondary button';
LinkSecondaryButton.args = {...LinkCTAButton.args, variant: 'secondary'};
export const LinkOverBackGroundButton = BackgroundTemplate<'a'>().bind({});
LinkOverBackGroundButton.storyName = 'link overBackground button';
LinkOverBackGroundButton.args = {...LinkCTAButton.args, variant: 'overBackground'};
export const LinkNegativeButton = Template<'a'>().bind({});
LinkNegativeButton.storyName = 'link negative button';
LinkNegativeButton.args = {...LinkCTAButton.args, variant: 'negative'};

