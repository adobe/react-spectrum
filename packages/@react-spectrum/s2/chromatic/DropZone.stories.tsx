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

import {Button} from '../src/Button';

import {ButtonGroup} from '../src/ButtonGroup';
import Cloud from '../spectrum-illustrations/linear/Cloud';
import CloudUpload from '../spectrum-illustrations/gradient/generic1/CloudUpload';
import {Content, Heading} from '../src/Content';
import DropToUpload from '../spectrum-illustrations/linear/DropToUpload';
import {DropZone, DropZoneProps} from '../src/DropZone';
import {FileTrigger} from 'react-aria-components/FileTrigger';
import {FocusRing} from 'react-aria/FocusRing';
import {IllustratedMessage} from '../src/IllustratedMessage';
import {mergeProps} from 'react-aria/mergeProps';
import type {Meta, StoryObj} from '@storybook/react';
import React, {ReactElement, useState} from 'react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useButton} from 'react-aria/useButton';
import {useClipboard} from 'react-aria/useClipboard';
import {useDrag} from 'react-aria/useDrag';

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/DropZone'
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
          <Heading>Drag or paste your file</Heading>
          <Content>Or, select a file from your computer</Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const Example: StoryObj<typeof ExampleRender> = {
  render: (args: any) => <ExampleRender {...args} />
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
          <Heading>Drag or paste your file</Heading>
          <Content>Or, select a file from your computer</Content>
          <ButtonGroup>
            <FileTrigger onSelect={() => setIsFilled(true)}>
              <Button variant="accent">Browse files</Button>
            </FileTrigger>
          </ButtonGroup>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const ExampleWithFileTrigger: StoryObj<typeof ExampleWithFileTriggerRender> = {
  render: args => <ExampleWithFileTriggerRender {...args} />
};

const LongBannerRender = (args: DropZoneProps): ReactElement => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone
        {...args}
        replaceMessage="A really long message that will show the text wrapping hopefully"
        styles={style({width: 320, height: 280})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <DropToUpload />
          <Heading>Drag or paste your file</Heading>
          <Content>Or, select a file from your computer</Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const LongBanner: StoryObj<typeof LongBannerRender> = {
  render: args => <LongBannerRender {...args} />
};

function Draggable() {
  let {dragProps} = useDrag({
    getItems() {
      return [
        {
          'text/plain': 'hello world'
        }
      ];
    },
    getAllowedDropOperations() {
      return ['copy'];
    }
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [
        {
          'text/plain': 'hello world'
        }
      ];
    }
  });

  let ref = React.useRef(null);
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing>
      <div
        className={style({color: 'gray-900'})}
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}>
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}

const GradientExample = (args: DropZoneProps): ReactElement => {
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
          <CloudUpload />
          <Heading>Drag or paste your file</Heading>
          <Content>Or, select a file from your computer</Content>
        </IllustratedMessage>
      </DropZone>
    </>
  );
};

export const Gradient: StoryObj<typeof GradientExample> = {
  render: args => <GradientExample {...args} />
};
