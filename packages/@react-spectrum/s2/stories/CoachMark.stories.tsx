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
  ActionMenuContext,
  Button,
  ButtonGroup,
  CardPreview,
  Checkbox,
  UNSTABLE_CoachMark as CoachMark,
  UNSTABLE_CoachMarkTrigger as CoachMarkTrigger,
  Content,
  ContentContext,
  DividerContext,
  Footer,
  FooterContext,
  Image,
  ImageContext,
  ImageCoordinator,
  Keyboard,
  KeyboardContext,
  MenuItem,
  Slider,
  Text,
  TextContext
} from '../src';
import {card} from '../src/Card';
import {DEFAULT_SLOT, Provider} from 'react-aria-components';
import Filter from '../s2wf-icons/S2_Icon_Filter_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {space, style} from '../style' with {type: 'macro'};
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
          <CoachMarkCard>
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
              <ButtonGroup>
                <Button fillStyle="outline" variant="secondary">Previous</Button>
                <Button variant="primary">Next</Button>
              </ButtonGroup>
            </Footer>
          </CoachMarkCard>
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
          <CoachMarkCard>
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
          </CoachMarkCard>
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
          <CoachMarkCard>
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
              <ButtonGroup>
                <Button fillStyle="outline" variant="secondary">Previous</Button>
                <Button variant="primary">Next</Button>
              </ButtonGroup>
            </Footer>
          </CoachMarkCard>
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
          <CoachMarkCard>
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
              <ButtonGroup>
                <Button fillStyle="outline" variant="secondary">Previous</Button>
                <Button variant="primary">Next</Button>
              </ButtonGroup>
            </Footer>
          </CoachMarkCard>
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

function CoachMarkCard(props) {
  let {size = 'M'} = props;
  return (
    <div className={card({size, density: 'regular'})}>
      <Provider
        values={[
          [ImageContext, {alt: '', styles: image}],
          [TextContext, {
            slots: {
              [DEFAULT_SLOT]: {},
              title: {styles: title({size})},
              description: {styles: description({size})},
              steps: {styles: steps}
            }
          }],
          [KeyboardContext, {styles: keyboard}],
          [ContentContext, {styles: content({size})}],
          [DividerContext, {size: 'S'}],
          [FooterContext, {styles: footer}],
          [ActionMenuContext, {
            isQuiet: true,
            size: actionButtonSize[size],
            // @ts-ignore
            'data-slot': 'menu',
            styles: actionMenu
          }]
        ]}>
        <ImageCoordinator>
          {props.children}
        </ImageCoordinator>
      </Provider>
    </div>
  );
}


const image = style({
  width: 'full',
  aspectRatio: '[3/2]',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none'
});

let title = style({
  font: 'title',
  fontSize: {
    size: {
      XS: 'title-xs',
      S: 'title-xs',
      M: 'title-sm',
      L: 'title',
      XL: 'title-lg'
    }
  },
  lineClamp: 3,
  gridArea: 'title'
});

let description = style({
  font: 'body',
  fontSize: {
    size: {
      XS: 'body-2xs',
      S: 'body-2xs',
      M: 'body-xs',
      L: 'body-sm',
      XL: 'body'
    }
  },
  lineClamp: 3,
  gridArea: 'description'
});

let keyboard = style({
  gridArea: 'keyboard',
  font: 'ui',
  fontWeight: 'light',
  color: 'gray-600',
  background: 'gray-25',
  unicodeBidi: 'plaintext'
});

let steps = style({
  font: 'detail',
  fontSize: 'detail-sm',
  alignSelf: 'center'
});

let content = style({
  display: 'grid',
  // By default, all elements are displayed in a stack.
  // If an action menu is present, place it next to the title.
  gridTemplateColumns: {
    default: ['1fr'],
    ':has([data-slot=menu])': ['minmax(0, 1fr)', 'auto']
  },
  gridTemplateAreas: {
    default: [
      'title keyboard',
      'description keyboard'
    ],
    ':has([data-slot=menu])': [
      'title menu',
      'keyboard keyboard',
      'description description'
    ]
  },
  columnGap: 4,
  flexGrow: 1,
  alignItems: 'baseline',
  alignContent: 'space-between',
  rowGap: {
    size: {
      XS: 4,
      S: 4,
      M: space(6),
      L: space(6),
      XL: 8
    }
  },
  paddingTop: {
    default: '--card-spacing',
    ':first-child': 0
  },
  paddingBottom: {
    default: '[calc(var(--card-spacing) * 1.5 / 2)]',
    ':last-child': 0
  }
});

let actionMenu = style({
  gridArea: 'menu',
  // Don't cause the row to expand, preserve gap between title and description text.
  // Would use -100% here but it doesn't work in Firefox.
  marginY: '[calc(-1 * self(height))]'
});

let footer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: 8,
  paddingTop: '[calc(var(--card-spacing) * 1.5 / 2)]'
});

const actionButtonSize = {
  XS: 'XS',
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;
