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

import {ActionButton} from '../src/ActionButton';
import {ActionButtonGroup, ActionButtonGroupProps} from '../src/ActionButtonGroup';
import {
  categorizeArgTypes,
  getActionArgs,
  StaticColorDecorator,
  StaticColorProvider
} from '../stories/utils';
import Copy from '../s2wf-icons/S2_Icon_Copy_20_N.svg';
import Cut from '../s2wf-icons/S2_Icon_Cut_20_N.svg';
import {generateComboChunks, shortName} from './utils';
import type {Meta, StoryObj} from '@storybook/react';
import Paste from '../s2wf-icons/S2_Icon_Paste_20_N.svg';
import {ReactElement, ReactNode} from 'react';
import {style} from '../style' with {type: 'macro'};
import {Text} from '../src/Content';

const events = ['onPress', 'onPressChange', 'onPressEnd', 'onPressStart', 'onPressUp', 'onChange'];

const meta: Meta<typeof ActionButtonGroup> = {
  component: ActionButtonGroup,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  argTypes: {
    ...categorizeArgTypes('Events', events)
  },
  args: {...getActionArgs(events)},
  title: 'S2 Chromatic/ActionButtonGroup'
};

export default meta;

let justifiedStyle = style({
  width: {
    default: 500,
    orientation: {
      vertical: 'auto'
    }
  },
  height: {
    orientation: {
      vertical: 500
    }
  }
});

export const Example: StoryObj<typeof ActionButtonGroup> = {
  render: args => (
    <ActionButtonGroup {...args} styles={args.isJustified ? justifiedStyle(args) : undefined}>
      <ActionButton>
        <Cut />
        <Text slot="label">Cut</Text>
      </ActionButton>
      <ActionButton>
        <Copy />
        <Text slot="label">Copy</Text>
      </ActionButton>
      <ActionButton>
        <Paste />
        <Text slot="label">Paste</Text>
      </ActionButton>
    </ActionButtonGroup>
  )
};

export const IconOnly: StoryObj<typeof ActionButtonGroup> = {
  render: args => (
    <ActionButtonGroup {...args} styles={args.isJustified ? justifiedStyle(args) : undefined}>
      <ActionButton aria-label="Cut">
        <Cut />
      </ActionButton>
      <ActionButton aria-label="Copy">
        <Copy />
      </ActionButton>
      <ActionButton aria-label="Paste">
        <Paste />
      </ActionButton>
    </ActionButtonGroup>
  )
};

export const Justified: StoryObj<typeof ActionButtonGroup> = {
  render: args => (
    <ActionButtonGroup {...args} isJustified styles={justifiedStyle(args)}>
      <ActionButton>
        <Cut />
        <Text slot="label">Cut</Text>
      </ActionButton>
      <ActionButton>
        <Copy />
        <Text slot="label">Copy</Text>
      </ActionButton>
      <ActionButton>
        <Paste />
        <Text slot="label">Paste</Text>
      </ActionButton>
    </ActionButtonGroup>
  )
};

let states = [
  {isDisabled: true},
  {isQuiet: true},
  {isJustified: true},
  {size: ['XS', 'S', 'M', 'L', 'XL']},
  {density: ['compact', 'regular']},
  {staticColor: ['black', 'white']}
];

let combinationChunks = generateComboChunks({states, numChunks: 3});

let Template = ({
  combos,
  orientation,
  children
}: {
  combos: any[];
  orientation: 'horizontal' | 'vertical';
  children: ReactNode;
}): ReactElement => (
  <div
    className={style({
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'start',
      gap: 24,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    })}>
    {combos.map(c => {
      let fullComboName = Object.keys(c)
        .map(k => `${k}: ${c[k]}`)
        .join(' ');
      let key = Object.keys(c)
        .map(k => shortName(k, c[k]))
        .join(' ');
      if (!key) {
        key = 'default';
      }

      let group = (
        <ActionButtonGroup
          key={key}
          data-testid={fullComboName}
          orientation={orientation}
          {...(c as ActionButtonGroupProps)}
          styles={c.isJustified ? justifiedStyle({...c, orientation}) : undefined}>
          {children}
        </ActionButtonGroup>
      );

      if (c.staticColor != null) {
        return (
          <StaticColorProvider key={`static-${key}`} staticColor={c.staticColor}>
            {group}
          </StaticColorProvider>
        );
      }

      return group;
    })}
  </div>
);

let labeledChildren = (
  <>
    <ActionButton>
      <Cut />
      <Text slot="label">Cut</Text>
    </ActionButton>
    <ActionButton>
      <Copy />
      <Text slot="label">Copy</Text>
    </ActionButton>
    <ActionButton>
      <Paste />
      <Text slot="label">Paste</Text>
    </ActionButton>
  </>
);

let iconOnlyChildren = (
  <>
    <ActionButton aria-label="Cut">
      <Cut />
    </ActionButton>
    <ActionButton aria-label="Copy">
      <Copy />
    </ActionButton>
    <ActionButton aria-label="Paste">
      <Paste />
    </ActionButton>
  </>
);

export const HorizontalCombo: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="horizontal">
      {labeledChildren}
    </Template>
  ),
  args: {combos: combinationChunks[0]}
};

export const HorizontalComboPt2: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="horizontal">
      {labeledChildren}
    </Template>
  ),
  args: {combos: combinationChunks[1]}
};

export const HorizontalComboPt3: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="horizontal">
      {labeledChildren}
    </Template>
  ),
  args: {combos: combinationChunks[2]}
};

export const VerticalCombo: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="vertical">
      {labeledChildren}
    </Template>
  ),
  args: {combos: combinationChunks[0]}
};

export const VerticalComboPt2: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="vertical">
      {labeledChildren}
    </Template>
  ),
  args: {combos: combinationChunks[1]}
};

export const VerticalComboPt3: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="vertical">
      {labeledChildren}
    </Template>
  ),
  args: {combos: combinationChunks[2]}
};

export const HorizontalComboIconOnly: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="horizontal">
      {iconOnlyChildren}
    </Template>
  ),
  args: {combos: combinationChunks[0]}
};

export const HorizontalComboIconOnlyPt2: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="horizontal">
      {iconOnlyChildren}
    </Template>
  ),
  args: {combos: combinationChunks[1]}
};

export const HorizontalComboIconOnlyPt3: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="horizontal">
      {iconOnlyChildren}
    </Template>
  ),
  args: {combos: combinationChunks[2]}
};

export const VerticalComboIconOnly: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="vertical">
      {iconOnlyChildren}
    </Template>
  ),
  args: {combos: combinationChunks[0]}
};

export const VerticalComboIconOnlyPt2: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="vertical">
      {iconOnlyChildren}
    </Template>
  ),
  args: {combos: combinationChunks[1]}
};

export const VerticalComboIconOnlyPt3: StoryObj<typeof Template> = {
  render: args => (
    <Template {...args} orientation="vertical">
      {iconOnlyChildren}
    </Template>
  ),
  args: {combos: combinationChunks[2]}
};
