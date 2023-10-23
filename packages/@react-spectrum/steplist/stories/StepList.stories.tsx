/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import {Item} from '@react-stately/collections';
import {Picker} from '@react-spectrum/picker';
import React, {Key, useMemo, useState} from 'react';
import {SpectrumStepListProps} from '@react-types/steplist';
import {StepList} from '../';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';

const options = [{
  key: 'details', value: 'Details'
}, {
  key: 'select-offers', value: 'Select offers'
}, {
  key: 'fallback-offer', value: 'Fallback offer'
}, {
  key: 'summary', value: 'Summary'
}];

export default {
  title: 'StepList',
  component: StepList,
  args: {
    onSelectionChange: action('onSelectionChange'),
    onLastCompletedStepChange: action('onLastCompletedStepChange')
  },
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    isEmphasized: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    orientation: {
      control: {
        type: 'inline-radio',
        options: ['horizontal', 'vertical']
      }
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['S', 'M', 'L', 'XL']
      }
    }
  }
} as ComponentMeta<typeof StepList>;

function DefaultStepList(props: SpectrumStepListProps<object>) {
  return (
    <StepList {...props}>
      {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
    </StepList>
  );
}

export type DefaultStory = ComponentStoryObj<typeof DefaultStepList>;
export type StepListStory = ComponentStoryObj<typeof StepList>;

export const Default: DefaultStory = {
  render: (args) => <DefaultStepList {...args} />
};

export const DefaultCompleted: DefaultStory = {
  render: (args) => <DefaultStepList {...args} defaultLastCompletedStep="summary" defaultSelectedKey="summary" />,
  name: 'Default - Completed'
};

export const DisabledKeys: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key,
    disabledKeys: options.map(o => o.key)
  },
  name: 'disabledKeys'
};

export const WithButtonsDefault: StepListStory = {
  render: (args) => <WithButtons {...args} />,
  name: 'Control Selected Key'
};

export const WithButtonsDefaultCompletedStep: StepListStory = {
  render: (args) => (
    <WithButtons
      defaultLastCompletedStep="select-offers"
      defaultSelectedKey="fallback-offer"
      {...args} />
  ),
  name: 'Control Selected Key with Default Completed Step'
};

function WithButtons(args) {
  const keys = useMemo(() => options.map(o => o.key), []);
  const initialStepNumberKey = args.defaultSelectedKey || args.defaultLastCompletedStep || keys[0];
  let [stepNumber, setStepNumber] = useState(keys.indexOf(initialStepNumberKey) + 1);
  let [lastCompletedStepText, setLastCompletedStepText] = useState(args.defaultLastCompletedStep);

  return (
    <View>
      <StepList
        {...args}
        onSelectionChange={(key) => {
          let index = options.findIndex(o => o.key === key);
          args.onSelectionChange(key);
          setStepNumber(Math.max(index + 1, 1));
        }}
        onLastCompletedStepChange={(key) => setLastCompletedStepText(key)}
        selectedKey={keys[stepNumber - 1]}>
        {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
      </StepList>
      <Flex marginTop="size-300">
        <ButtonGroup>
          <Button
            isDisabled={stepNumber === 1}
            variant="secondary"
            onPress={() => setStepNumber(stepNumber - 1)}>
            Back
          </Button>
          <Button
            isDisabled={stepNumber === keys.length}
            variant="cta"
            onPress={() => setStepNumber(stepNumber + 1)}>
            Next
          </Button>
        </ButtonGroup>
        {lastCompletedStepText && (
        <View marginStart="size-300">
          <Text>
            Last Completed Step: {lastCompletedStepText}
          </Text>
        </View>
        )}
      </Flex>
    </View>
  );
}

export const ControlledStory: StepListStory = {
  render: (args) => <Controlled {...args} selectedKey="details" />,
  name: 'Controlled'
};

function Controlled(args) {
  const [lastCompletedStep, setLastCompletedStep] = useState<Key>(args.lastCompletedStep);
  const [selectedKey, setSelectedKey] = useState<Key>(args.selectedKey);

  return (
    <View>
      <StepList
        {...args}
        lastCompletedStep={lastCompletedStep}
        selectedKey={selectedKey}>
        {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
      </StepList>
      <Flex marginTop="size-300">
        <Picker label="lastCompletedStep" onSelectionChange={setLastCompletedStep} selectedKey={lastCompletedStep}>
          {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
        </Picker>
        <Picker label="selectedKey" onSelectionChange={setSelectedKey} selectedKey={selectedKey}>
          {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
        </Picker>
      </Flex>
    </View>
  );
}
