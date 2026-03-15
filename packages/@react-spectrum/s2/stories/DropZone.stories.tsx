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

import {Button, ButtonGroup, Content, DropZone, DropZoneProps, FileTrigger, Heading, IllustratedMessage} from '../src';
import {categorizeArgTypes, getActionArgs} from './utils';
import Cloud from '../spectrum-illustrations/linear/Cloud';
import CloudUpload from '../spectrum-illustrations/gradient/generic1/CloudUpload';
import DropToUpload from '../spectrum-illustrations/linear/DropToUpload';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import type {Meta, StoryObj} from '@storybook/react';
import React, {ReactElement, useState} from 'react';
import {style} from '../style' with { type: 'macro' };

const events = ['onDrop', 'onDropActivate', 'onDropEnter', 'onDropExit', 'onDropMove'];

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  },
  args: {...getActionArgs(events)},
  title: 'DropZone'
};

export default meta;

const ExampleRender = (args: DropZoneProps): ReactElement => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone
        {...args}
        styles={style({width: 320, height: 280})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <DropToUpload />
          <Heading>
            Drag or paste your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const Example: StoryObj<typeof ExampleRender> = {
  render: (args) => <ExampleRender {...args} />
};

const ExampleWithFileTriggerRender = (args: DropZoneProps): ReactElement => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone
        {...args}
        styles={style({width: 380, height: 280})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <Cloud />
          <Heading>
            Drag or paste your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
          <ButtonGroup>
            <FileTrigger
              onSelect={() => setIsFilled(true)}>
              <Button variant="accent" >Browse files</Button>
            </FileTrigger>
          </ButtonGroup>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const ExampleWithFileTrigger: StoryObj<typeof ExampleWithFileTriggerRender> = {
  render: (args) => <ExampleWithFileTriggerRender {...args} />
};

const LongBannerRender = (args: DropZoneProps): ReactElement => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone
        {...args}
        replaceMessage="A really long message that will show the text wrapping hopefully"
        styles={style({width: 380, height: 280})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <DropToUpload />
          <Heading>
            Drag or paste your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const LongBanner: StoryObj<typeof LongBannerRender> = {
  render: (args) => <LongBannerRender {...args} />
};

const GradientRender = (args: DropZoneProps): ReactElement => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone
        {...args}
        styles={style({width: 380, height: 280})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <CloudUpload />
          <Heading>
            Drag or paste your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const Gradient: StoryObj<typeof GradientRender> = {
  render: (args) => <GradientRender {...args} />
};

function Draggable() {
  let {dragProps} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    }
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });

  let ref = React.useRef(null);
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing >
      <div
        className={style({color: 'gray-900'})}
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}>
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}
