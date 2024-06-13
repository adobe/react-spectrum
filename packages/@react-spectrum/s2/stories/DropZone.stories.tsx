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

import type {Meta} from '@storybook/react';
import {Button, ButtonGroup, DropZone, FileTrigger, Illustration, IllustratedMessage, Heading, Content} from '../src';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import React, {useState} from 'react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import DropToUpload from '../spectrum-illustrations/dropToUpload.svg';
import Cloud from '../spectrum-illustrations/Cloud.svg';
import {categorizeArgTypes} from './utils';

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onDrop', 'onDropActivate', 'onDropEnter', 'onDropExit', 'onDropMove'])
  }
};

export default meta;

export const Example = (args: any) => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone 
        {...args}
        className={style({width: '[320px]', height: '[280px]'})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <Illustration>
            <DropToUpload />
          </Illustration>
          <Heading>
            Drag and drop your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const ExampleWithFileTrigger = (args: any) => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone 
        {...args}
        className={style({width: '[380px]', height: '[280px]'})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <Illustration>
            <Cloud />
          </Illustration>
          <Heading>
            Drag and drop your file
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

export const LongBanner = (args: any) => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone 
        {...args}
        replaceMessage="A really long message that will show the text wrapping hopefully"
        className={style({width: '[320px]', height: '[280px]'})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <Illustration>
            <DropToUpload />
          </Illustration>
          <Heading>
            Drag and drop your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
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
