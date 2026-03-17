/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  ActionButton,
  ActionMenu,
  Button,
  CardPreview,
  Checkbox,
  Content,
  Footer,
  Image,
  Keyboard,
  MenuItem,
  Slider,
  Text
} from '../src';
import {CoachMark, CoachMarkTrigger} from '../src/CoachMark';
import Filter from '../s2wf-icons/S2_Icon_Filter_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};
import {useState} from 'react';

const meta: Meta<typeof CoachMark> = {
  component: CoachMark,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: 'radio',
      options: ['top', 'left', 'left top', 'right', 'right top', 'bottom']
    }
  },
  title: 'CoachMark'
};

export default meta;
type Story = StoryObj<typeof CoachMark>;

export const CoachMarkExample: Story = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button>Before</Button>
      <CoachMarkTrigger defaultOpen>
        <Checkbox>Sync with CC</Checkbox>
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button>After</Button>
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};

function ControlledCoachMark(args) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button onPress={() => setIsOpen(true)}>Open</Button>
      <CoachMarkTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <Checkbox>Sync with CC</Checkbox>
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button onPress={() => setIsOpen(false)}>Close</Button>
    </div>
  );
}

export const CoachMarkRestartable: Story = {
  render: (args) => (
    <ControlledCoachMark {...args} />
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const CoachMarkSlider: Story = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button>Before</Button>
      <CoachMarkTrigger defaultOpen>
        <Slider label="Horizontal position" labelPosition="top" />
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button>After</Button>
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const CoachMarkButton: Story = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button>Before</Button>
      <CoachMarkTrigger defaultOpen>
        <ActionButton>
          <Filter />
        </ActionButton>
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button>After</Button>
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};
