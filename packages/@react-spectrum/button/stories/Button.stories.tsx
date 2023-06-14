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
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import React, {ElementType} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import {Text} from '@react-spectrum/text';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import {View} from '@react-spectrum/view';

export type ButtonStory = ComponentStoryObj<typeof Button>;

export default {
  title: 'Button',
  component: Button,
  args: {
    onPress: action('press'),
    onPressStart: action('pressstart'),
    onPressEnd: action('pressend')
  },
  argTypes: {
    onPress: {
      table: {
        disable: true
      }
    },
    onPressStart: {
      table: {
        disable: true
      }
    },
    onPressEnd: {
      table: {
        disable: true
      }
    },
    autoFocus: {
      control: 'boolean'
    },
    variant: {
      control: 'select',
      options: ['accent', 'primary', 'secondary', 'negative', 'cta', 'overBackground'],
      defaultValue: 'accent'
    },
    style: {
      control: 'select',
      options: ['fill', 'outline']
    },
    staticColor: {
      control: 'select',
      options: ['white', 'black']
    }
  }
} as ComponentMeta<typeof Button>;

export const Default: ButtonStory = {
  render: (args) => render(args)
};

export const WithIcon: ButtonStory = {
  render: (args) => renderIconText(args)
};

export const IconOnly: ButtonStory = {
  render: (args) => renderIconOnly(args)
};

export const AnchorElement: ButtonStory = {
  render: (args) => render({elementType: 'a', ...args}),
  name: 'element: a'
};

export const AnchorElementWithSelf: ButtonStory = {
  render: (args) => render({elementType: 'a',  href: '//example.com', target: '_self', ...args}),
  name: 'element: a, href: \'//example.com\', target: \'_self\''
};

export const AnchorElementNoRefferer: ButtonStory = {
  render: (args) => render({elementType: 'a', href: '//example.com', rel: 'noopener noreferrer', ...args}),
  name: 'element: a, rel: \'noopener noreferrer\''
};

export const UserSelect: ButtonStory = {
  render: () => <Example />,
  parameters: {
    description: {
      data: 'Pressing and holding on either buttons shouldn\'t trigger text selection on the button labels (wait for buttons to turn red).'
    }
  }
};

function render<T extends ElementType = 'button'>(props: SpectrumButtonProps<T> = {variant: 'primary'}) {
  let buttons = (
    <Flex gap="size-200">
      <Button {...props}>
        Default
      </Button>
      <Button {...props} isDisabled>
        Disabled
      </Button>
    </Flex>
  );

  if (props.variant === 'overBackground' || props.staticColor === 'white') {
    return (
      <View backgroundColor="static-blue-700" UNSAFE_style={{padding: '15px 20px', display: 'inline-block'}}>
        {buttons}
      </View>
    );
  }

  if (props.staticColor === 'black') {
    return (
      <div style={{backgroundColor: 'rgb(206, 247, 243)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {buttons}
      </div>
    );
  }

  return buttons;
}

function renderIconText<T extends ElementType = 'button'>(props: SpectrumButtonProps<T> = {variant: 'primary'}) {
  let buttons = (
    <Flex gap="size-200">
      <Button {...props}>
        <Bell />
        <Text>Default</Text>
      </Button>
      <Button {...props} isDisabled>
        <Bell />
        <Text>Disabled</Text>
      </Button>
    </Flex>
  );

  if (props.variant === 'overBackground' || props.staticColor === 'white') {
    return (
      <View backgroundColor="static-blue-700" UNSAFE_style={{padding: '15px 20px', display: 'inline-block'}}>
        {buttons}
      </View>
    );
  }

  if (props.staticColor === 'black') {
    return (
      <div style={{backgroundColor: 'rgb(206, 247, 243)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {buttons}
      </div>
    );
  }

  return buttons;
}

function renderIconOnly<T extends ElementType = 'button'>(props: SpectrumButtonProps<T> = {variant: 'primary'}) {
  let buttons = (
    <Flex gap="size-200">
      <TooltipTrigger offset={2}>
        <Button {...props} aria-label="Notifications">
          <Bell />
        </Button>
        <Tooltip>Notifications</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger offset={2}>
        <Button {...props} aria-label="Notifications (disabled)" isDisabled>
          <Bell />
        </Button>
        <Tooltip>Notifications</Tooltip>
      </TooltipTrigger>
    </Flex>
  );

  if (props.variant === 'overBackground' || props.staticColor === 'white') {
    return (
      <View backgroundColor="static-blue-700" UNSAFE_style={{padding: '15px 20px', display: 'inline-block'}}>
        {buttons}
      </View>
    );
  }

  if (props.staticColor === 'black') {
    return (
      <div style={{backgroundColor: 'rgb(206, 247, 243)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {buttons}
      </div>
    );
  }

  return buttons;
}

function Example() {
  let [show, setShow] = React.useState(false);
  let [show2, setShow2] = React.useState(false);

  return (
    <Flex gap="size-200">
      <Button
        variant="cta"
        UNSAFE_style={show ? undefined : {background: 'red', userSelect: 'text'}}
        onPressStart={() => setTimeout(() => setShow(true), 3000)}>
        Press and hold (overwrite)
      </Button>
      <Button
        variant="cta"
        UNSAFE_style={show2 ? undefined : {background: 'red'}}
        onPressStart={() => setTimeout(() => setShow2(true), 3000)}>
        Press and hold (no overwrite)
      </Button>
    </Flex>
  );
}
