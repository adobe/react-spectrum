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
import {Item} from '@react-stately/collections';
import React, {useMemo, useState} from 'react';
import {SpectrumStepListProps} from '@react-types/steplist';
import {StepList} from '../';
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
    onSelectionChange: action('onAction')
  },
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    isEmphasized: {
      control: {
        type: 'boolean'
      }
    },
    isReadOnly: {
      control: {
        type: 'boolean'
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
  name: 'With buttons'
};

export const WithButtonsControlled: StepListStory = {
  render: (args) => <WithButtons lastCompletedStep="select-offers" {...args} />,
  name: 'With buttons (Controlled)'
};

export const WithButtonsDefaultCompletedStep: StepListStory = {
  render: (args) => <WithButtons defaultLastCompletedStep="select-offers" {...args} />,
  name: 'With buttons (Default completed step)'
};

function WithButtons(args) {
  let [stepNumber, setStepNumber] = useState(1);
  const keys = useMemo(() => options.map(o => o.key), []);

  return (
    <View>
      <StepList
        {...args}
        onSelectionChange={(key) => {
          console.log(key);
          let index = options.findIndex(o => o.key === key);
          console.log(index);
          setStepNumber(Math.max(index + 1, 1));
        }}
        selectedKey={keys[stepNumber - 1]}>
        {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
      </StepList>
      <View marginTop="size-300">
        <ButtonGroup>
          <Button
            variant="secondary"
            onPress={() => {
              setStepNumber(Math.max(stepNumber - 1, 1));
            }}>Back</Button>
          <Button
            isDisabled={args.lastCompletedStep && keys.indexOf(args.lastCompletedStep) === stepNumber - 1}
            variant="cta"
            onPress={() => {
              const newStepNumber = stepNumber + 1;
              setStepNumber(Math.min(newStepNumber, keys.length));
            }}>
            Next
          </Button>
        </ButtonGroup>
      </View>
    </View>
  );
}
