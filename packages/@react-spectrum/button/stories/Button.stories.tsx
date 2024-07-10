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
import {BackgroundColorValue} from '@react-types/shared';
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import React, {ElementType, useState} from 'react';
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
    onPressEnd: action('pressend'),
    onPressChange: action('presschange'),
    onPressUp: action('pressup'),
    onFocus: action('focus'),
    onBlur: action('blur'),
    onKeyUp: action('keyup')
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
    onPressUp: {
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
      options: [undefined, 'fill', 'outline']
    },
    staticColor: {
      control: 'select',
      options: [undefined, 'white', 'black']
    },
    isPending: {
      control: 'boolean',
      defaultValue: false
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

export const PendingSpinner: ButtonStory = {
  render: (args) => <Pending {...args} />
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

function PendingButtonContainerComponent(props) {
  let {children, ...otherProps} = props;

  function containerBackgroundColor(variant, staticColor): BackgroundColorValue | undefined {
    if (variant === 'overBackground' || staticColor === 'white') {
      return 'static-blue-700';
    }
    if (staticColor === 'black') {
      return 'static-yellow-200';
    }
    return;
  }

  return (
    <View backgroundColor={containerBackgroundColor(otherProps.variant, otherProps.staticColor)} padding={16} {...otherProps}>
      {children}
    </View>
  );
}

function Pending(props) {
  let [tooltipPending, setTooltipPending] = useState(false);

  let handlePress = (e) => {
    action('press')(e);
    setTooltipPending(true);
    setTimeout(() => {
      setTooltipPending(false);
    }, timerValue);
  };

  return (
    <div>
      <Flex wrap="wrap">
        <PendingButtonContainerComponent {...props}>
          <PendingButtonComponent {...props}>click me!</PendingButtonComponent>
        </PendingButtonContainerComponent>

        <PendingButtonContainerComponent {...props}>
          <PendingButtonComponent
            {...props}>
            <Bell />
            <Text>I have an icon</Text>
          </PendingButtonComponent>
        </PendingButtonContainerComponent>

        <PendingButtonContainerComponent {...props}>
          <PendingButtonOnClickComponent
            {...props}>
            <Text>with onClick</Text>
          </PendingButtonOnClickComponent>
        </PendingButtonContainerComponent>

        <PendingButtonContainerComponent {...props}>
          <PendingButtonComponent isDisabled {...props}>disabled</PendingButtonComponent>
        </PendingButtonContainerComponent>
      </Flex>

      <Flex wrap="wrap" alignItems={'center'}>
        <Text>Aria-label "Button label" on button</Text>
        <PendingButtonContainerComponent {...props}>
          <PendingButtonComponent
            {...props}
            aria-label="Button label">
            <Bell />
          </PendingButtonComponent>
        </PendingButtonContainerComponent>

        <Text>Aria-label "icon label" on icon</Text>
        <PendingButtonContainerComponent {...props}>
          <PendingButtonComponent {...props}>
            <Bell aria-label="icon label" />
          </PendingButtonComponent>
        </PendingButtonContainerComponent>

        <Text>No aria-labels--bad implementation</Text>
        <PendingButtonContainerComponent {...props}>
          <PendingButtonComponent {...props}>
            <Bell />
          </PendingButtonComponent>
        </PendingButtonContainerComponent>

        <Text>Tooltip and aria-label "Notifications" on button</Text>
        <PendingButtonContainerComponent {...props}>
          <TooltipTrigger offset={2}>
            <Button {...props} isPending={tooltipPending} onPress={handlePress} aria-label="Notifications">
              <Bell />
            </Button>
            <Tooltip>Click here to view</Tooltip>
          </TooltipTrigger>
        </PendingButtonContainerComponent>

      </Flex>

      <Flex wrap="wrap" alignItems={'center'}>
        <PendingButtonContainerComponent {...props}>
          <Button {...props} isPending={props.isPending} onPress={() => {window.alert('use storybook control to change this button isPending prop');}}>
            <Text>Controlled</Text>
          </Button>
        </PendingButtonContainerComponent>
      </Flex>

      <Flex wrap="wrap" alignItems={'center'}>
        <PendingButtonContainerComponent {...props}>
          <PendingButtonFormComponent {...props} type="submit">
            Form submit
          </PendingButtonFormComponent>
        </PendingButtonContainerComponent>
      </Flex>
    </div>
  );
}
let timerValue = 5000;
function PendingButtonComponent(props) {
  let [isPending, setPending] = useState(false);

  let handlePress = (e) => {
    action('press')(e);
    setPending(true);
    setTimeout(() => {
      setPending(false);
    }, timerValue);
  };

  return (
    <Button
      {...props}
      isPending={isPending}
      onPress={handlePress}>
      {props.children}
    </Button>
  );
}

function PendingButtonOnClickComponent(props) {
  let [isPending, setPending] = useState(false);

  let handlePress = (e) => {
    action('click')(e);
    setPending(true);
    setTimeout(() => {
      setPending(false);
    }, timerValue);
  };

  return (
    <Button
      {...props}
      isPending={isPending}
      onClick={handlePress}>
      {props.children}
    </Button>
  );
}

function PendingButtonFormComponent(props) {
  let [isPending, setPending] = useState(false);

  let onSubmit = (e) => {
    console.log('onSubmit called.');
    e.preventDefault();
    if (!isPending) {
      setPending(true);
      setTimeout(() => {
        setPending(false);
      }, timerValue);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Button
        {...props}
        isPending={isPending}>
        {props.children}
      </Button>
    </Form>
  );
}
