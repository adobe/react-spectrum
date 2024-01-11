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
import React, {ElementType, useState} from 'react';
import {S2Icon} from '@react-spectrum/icon';
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
    onPressUp: action('pressup'),
    onFocus: action('focus'),
    onBlur: action('blur')
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

function Icon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M18 4.25V15.75C18 16.9907 16.9907 18 15.75 18H4.25C3.00928 18 2 16.9907 2 15.75V4.25C2 3.00928 3.00928 2 4.25 2H15.75C16.9907 2 18 3.00928 18 4.25ZM16.5 4.25C16.5 3.83643 16.1636 3.5 15.75 3.5H4.25C3.83643 3.5 3.5 3.83643 3.5 4.25V15.75C3.5 16.1636 3.83643 16.5 4.25 16.5H15.75C16.1636 16.5 16.5 16.1636 16.5 15.75V4.25Z" fill="currentColor" />
      <path d="M13.7632 10C13.7632 10.4214 13.4214 10.7632 13 10.7632H10.7632V13C10.7632 13.4214 10.4214 13.7632 10 13.7632C9.57862 13.7632 9.23682 13.4214 9.23682 13V10.7632H7C6.57861 10.7632 6.23682 10.4214 6.23682 10C6.23682 9.57862 6.57862 9.23682 7 9.23682H9.23682V7C9.23682 6.57861 9.57862 6.23682 10 6.23682C10.4214 6.23682 10.7632 6.57862 10.7632 7V9.23682H13C13.4214 9.23682 13.7632 9.57862 13.7632 10Z" fill="currentColor" />
    </svg>
  );
}

export const Default: ButtonStory = {
  render: (args) => render(args)
};

export const WithIcon: ButtonStory = {
  render: (args) => renderIconText(args)
};

export const WithS2Icon: ButtonStory = {
  render: (args) => (
    <Flex gap="size-200">
      <Button {...args}>
        <S2Icon><Icon /></S2Icon>
        <Text>Default</Text>
      </Button>
      <Button {...args} isDisabled>
        <S2Icon><Icon /></S2Icon>
        <Text>Disabled</Text>
      </Button>
    </Flex>
  )
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
