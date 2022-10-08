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

import {chain} from '@react-aria/utils';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import React, {useState} from 'react';
import {Switch} from '../';

type SwitchStory = ComponentStoryObj<typeof Switch>;

export default {
  title: 'Switch',
  component: Switch,
  args: {
    isEmphasized: false
  },
  argTypes: {
    onChange: {
      action: 'change'
    },
    onFocus: {
      action: 'focus'
    },
    onBlur: {
      action: 'blur'
    }
  }
} as ComponentMeta<typeof Switch>;

export const Default: SwitchStory = {
  args: {children: <>Switch Label</>}
};

export const DefaultSelectedTrue: SwitchStory = {
  ...Default,
  args: {...Default.args, defaultSelected: true},
  name: 'defaultSelected: true'
};

export const IsSelectedTrue: SwitchStory = {
  ...Default,
  args: {...Default.args, isSelected: true},
  name: 'isSelected: true'
};

export const IsSelectedFalse: SwitchStory = {
  ...Default,
  args: {...Default.args, isSelected: false},
  name: 'isSelected: false'
};

export const IsDisabledTrue: SwitchStory = {
  ...Default,
  args: {...Default.args, isDisabled: true},
  name: 'isDisabled: true'
};

export const IsReadOnlyTrueIsSelectedTrue: SwitchStory = {
  ...Default,
  args: {...Default.args, isReadOnly: true, isSelected: true},
  name: 'isReadOnly: true, isSelected: true'
};

export const AutoFocus: SwitchStory = {
  ...Default,
  args: {...Default.args, autoFocus: true},
  name: 'autoFocus'
};

export const CustomLabel: SwitchStory = {
  ...Default,
  args: {children: (
    <span>
      <i>Italicized</i> Switch Label
    </span>
  )},
  name: 'custom label'
};

export const LongLabel: SwitchStory = {
  ...Default,
  args: {children: (
    <>
      Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris. Italiam,
      fato profugus, Laviniaque venit.
    </>
  )},
  name: 'long label'
};

export const NoLabel: SwitchStory = {
  ...Default,
  args: {'aria-label': 'This switch has no visible label'},
  name: 'no label',
  parameters: {description: {data: 'Try me with a screen reader.'}}
};

export const ControlledImplementation: SwitchStory = {
  ...Default,
  render: (args) => <ControlledSwitch {...args} />
};

function ControlledSwitch(props) {
  let [checked, setChecked] = useState(false);
  return <Switch {...props} onChange={chain(setChecked, props.onChange)} isSelected={checked} />;
}

export const WHCMTest: SwitchStory = {
  render: () => (
    <Flex direction="column" gap="size-200">
      <Flex gap="size-200">
        <Switch>Option</Switch>
        <Switch isDisabled>Option</Switch>
      </Flex>
      <Flex gap="size-200">
        <Switch isSelected isEmphasized>Option</Switch>
        <Switch isSelected isEmphasized isDisabled>Option</Switch>
      </Flex>
      <Flex gap="size-200">
        <Switch isSelected>Option</Switch>
        <Switch isSelected isDisabled>Option</Switch>
      </Flex>
    </Flex>
  ),
  name: 'WHCM test'
};
