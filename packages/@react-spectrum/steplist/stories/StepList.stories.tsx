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
import {Key} from '@react-types/shared';
import {Picker} from '@react-spectrum/picker';
import React, {useCallback, useMemo, useState} from 'react';
import {SpectrumStepListProps, StepList} from '../';
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
    onLastCompletedStepChange: {
      table: {
        disable: true
      }
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
  render: (args) => <DefaultStepList {...args} defaultLastCompletedStep="summary" />,
  name: 'Default - Completed'
};

export const DisabledAllKeys: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key,
    disabledKeys: options.map(o => o.key)
  },
  name: 'disabledAllKeys'
};

export const DisabledKey: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key,
    disabledKeys: new Set(['select-offers'])
  },
  name: 'disabledKeys'
};

export const Disabled: StepListStory = {
  args: {
    isDisabled: true,
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key
  },
  name: 'disabled'
};

export const ReadOnly: StepListStory = {
  args: {
    isReadOnly: true,
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key
  },
  name: 'readonly'
};

export const WithButtonsDefault: StepListStory = {
  render: (args) => <WithButtons {...args} />,
  name: 'Control Selected Key'
};

export const VerticalWithOddLengths: StepListStory = {
  args: {
    orientation: 'vertical',
    width: 75,
    children: options.map((o) => <Item key={o.key}>{`${o.value} ${o.value} ${o.value}`}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key
  },
  name: 'Vertical Odd names'
};

export const HorizontalWithOddLengths: StepListStory = {
  args: {
    width: 600,
    children: options.map((o) => <Item key={o.key}>{`${o.value} ${o.value} ${o.value}`}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key
  },
  name: 'Horizontal Odd names'
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
  let [stepNumber, setStepNumber] = useState(keys.indexOf(args.selectedKey || args.defaultSelectedKey) + 1);

  const selectedKey = useMemo(() => {
    return keys[stepNumber - 1];
  }, [keys, stepNumber]);

  const handleSelectionChange = useCallback((key) => {
    setStepNumber(keys.indexOf(key) + 1);
    args.onSelectionChange(key);
  }, [keys, args]);

  return (
    <View>
      <StepList
        {...args}
        onSelectionChange={handleSelectionChange}
        selectedKey={selectedKey}>
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
