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
import {Meta} from '@storybook/react';
import React from 'react';
import {SpectrumButtonProps} from '@react-types/button';
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

const Template = (args: SpectrumButtonProps) => <Button {...args} />;
const BackgroundTemplate = (args: SpectrumButtonProps) => (
  <div  style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
    <Button {...args} />
  </div>
);

const LinkTemplate = (args: SpectrumButtonProps) => <Button elementType="a" href="//example.com" target="_self" {...args} />;
const BackgroundLinkTemplate = (args: SpectrumButtonProps) => (
  <div  style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
    <Button elementType="a" href="//example.com" target="_self" {...args} />
  </div>
);

export const CTAButton = Template.bind({});
CTAButton.storyName = 'cta button';
CTAButton.args = {variant: 'cta', children: 'Default'};
export const PrimaryButton = Template.bind({});
PrimaryButton.storyName = 'primary button';
PrimaryButton.args = {variant: 'primary', children: 'Default'};
export const SecondaryButton = Template.bind({});
SecondaryButton.storyName = 'secondary button';
SecondaryButton.args = {variant: 'secondary', children: 'Default'};
export const OverBackGroundButton = BackgroundTemplate.bind({});
OverBackGroundButton.storyName = 'overBackground button';
OverBackGroundButton.args = {variant: 'overBackground', children: 'Default'};
export const NegativeButton = Template.bind({});
NegativeButton.storyName = 'negativeButton button';
NegativeButton.args = {variant: 'negative', children: 'Default'};

export const DisabledCTAButton = Template.bind({});
DisabledCTAButton.storyName = 'disabled cta button';
DisabledCTAButton.args = {...CTAButton.args, isDisabled: true};
export const DisabledPrimaryButton = Template.bind({});
DisabledPrimaryButton.storyName = 'disabled primary button';
DisabledPrimaryButton.args = {...PrimaryButton.args, isDisabled: true};
export const DisabledSecondaryButton = Template.bind({});
DisabledSecondaryButton.storyName = 'disabled secondary button';
DisabledSecondaryButton.args = {...SecondaryButton.args, isDisabled: true};
export const DisabledOverBackGroundButton = BackgroundTemplate.bind({});
DisabledOverBackGroundButton.storyName = 'disabled overbackground button';
DisabledOverBackGroundButton.args = {...OverBackGroundButton.args, isDisabled: true};
export const DisabledNegativeButton = Template.bind({});
DisabledNegativeButton.storyName = 'disabled negativeButton button';
DisabledNegativeButton.args = {...NegativeButton.args, isDisabled: true};


export const WithTextCTAButton = Template.bind({});
WithTextCTAButton.storyName = 'with text cta button';
WithTextCTAButton.args = {...CTAButton.args, children: <Text>Default</Text>};
export const WithTextPrimaryButton = Template.bind({});
WithTextPrimaryButton.storyName = 'with text primary button';
WithTextPrimaryButton.args = {...PrimaryButton.args, children: <Text>Default</Text>};
export const WithTextSecondaryButton = Template.bind({});
WithTextSecondaryButton.storyName = 'with text secondary button';
WithTextSecondaryButton.args = {...SecondaryButton.args, children: <Text>Default</Text>};
export const WithTextOverBackGroundButton = BackgroundTemplate.bind({});
WithTextOverBackGroundButton.storyName = 'with text overBackground button';
WithTextOverBackGroundButton.args = {...OverBackGroundButton.args, children: <Text>Default</Text>};
export const WithTextNegativeButton = Template.bind({});
WithTextNegativeButton.storyName = 'with text negativeButton button';
WithTextNegativeButton.args = {...NegativeButton.args, children: <Text>Default</Text>};


export const WithIconCTAButton = Template.bind({});
WithIconCTAButton.storyName = 'with icon cta button';
WithIconCTAButton.args = {...CTAButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconPrimaryButton = Template.bind({});
WithIconPrimaryButton.storyName = 'with icon primary button';
WithIconPrimaryButton.args = {...PrimaryButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconSecondaryButton = Template.bind({});
WithIconSecondaryButton.storyName = 'with icon secondary button';
WithIconSecondaryButton.args = {...SecondaryButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconOverBackGroundButton = BackgroundTemplate.bind({});
WithIconOverBackGroundButton.storyName = 'with icon overBackground button';
WithIconOverBackGroundButton.args = {...OverBackGroundButton.args, children: <Bell />, 'aria-label': 'Default'};
export const WithIconNegativeButton = Template.bind({});
WithIconNegativeButton.storyName = 'with icon negativeButton button';
WithIconNegativeButton.args = {...NegativeButton.args, children: <Bell />, 'aria-label': 'Default'};


export const WithBothCTAButton = Template.bind({});
WithBothCTAButton.storyName = 'with both cta button';
WithBothCTAButton.args = {...CTAButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothPrimaryButton = Template.bind({});
WithBothPrimaryButton.storyName = 'with both primary button';
WithBothPrimaryButton.args = {...PrimaryButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothSecondaryButton = Template.bind({});
WithBothSecondaryButton.storyName = 'with both secondary button';
WithBothSecondaryButton.args = {...SecondaryButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothOverBackGroundButton = BackgroundTemplate.bind({});
WithBothOverBackGroundButton.storyName = 'with both overBackground button';
WithBothOverBackGroundButton.args = {...OverBackGroundButton.args, children: <><Bell /><Text>Default</Text></>};
export const WithBothNegativeButton = Template.bind({});
WithBothNegativeButton.storyName = 'with both negativeButton button';
WithBothNegativeButton.args = {...NegativeButton.args, children: <><Bell /><Text>Default</Text></>};


export const LinkCTAButton = LinkTemplate.bind({});
LinkCTAButton.storyName = 'link cta button';
LinkCTAButton.args = {...CTAButton.args};
export const LinkPrimaryButton = LinkTemplate.bind({});
LinkPrimaryButton.storyName = 'link primary button';
LinkPrimaryButton.args = {...PrimaryButton.args};
export const LinkSecondaryButton = LinkTemplate.bind({});
LinkSecondaryButton.storyName = 'link secondary button';
LinkSecondaryButton.args = {...SecondaryButton.args};
export const LinkOverBackGroundButton = BackgroundLinkTemplate.bind({});
LinkOverBackGroundButton.storyName = 'link overBackground button';
LinkOverBackGroundButton.args = {...OverBackGroundButton.args};
export const LinkNegativeButton = LinkTemplate.bind({});
LinkNegativeButton.storyName = 'link negativeButton button';
LinkNegativeButton.args = {...NegativeButton.args};

export const NoOpenerLinkButton = LinkTemplate.bind({});
NoOpenerLinkButton.storyName = 'no opener link button';
NoOpenerLinkButton.args = {...PrimaryButton.args, target: undefined, rel: 'noopener noreferrer'};

/*
storiesOf('Button', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'variant: cta',
    () => render({variant: 'cta'})
  )
  .add(
    'with icon',
    () => (
      <Flex gap="size-200">
        <Button
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          variant="primary">
          <Bell />
          <Text>Default</Text>
        </Button>
        <Button
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isDisabled
          variant="primary">
          <Text>Disabled</Text>
          <Bell />
        </Button>
        <Button
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isQuiet
          variant="primary">
          <Bell />
          <Text>Quiet</Text>
        </Button>
      </Flex>
    )
  )
  .add(
    'variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground'})}
      </div>
    )
  )
  .add(
    'variant: primary',
    () => render({variant: 'primary'})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary'})
  )
  .add(
    'variant: negative',
    () => render({variant: 'negative'})
  )
  .add(
    'element: a',
    () => render({elementType: 'a', variant: 'primary'})
  )
  .add(
    'element: a, href: \'//example.com\', target: \'_self\'',
    () => render({elementType: 'a', href: '//example.com', target: '_self', variant: 'primary'})
  )
  .add(
    'element: a, rel: \'noopener noreferrer\'',
    () => render({elementType: 'a', href: '//example.com', rel: 'noopener noreferrer', variant: 'primary'})
  );


function render(props: any = {}) {
  return (
    <Flex gap="size-200">
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        Default
      </Button>
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props}>
        Disabled
      </Button>
      {props.variant !== 'cta' && (
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isQuiet
        {...props}>
        Quiet
      </Button>
      )}
    </Flex>
  );
}
*/
