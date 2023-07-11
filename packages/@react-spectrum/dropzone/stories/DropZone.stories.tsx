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
import {classNames} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import dndStyles from '@react-aria/dnd/stories/dnd.css';
import {DropZone} from '../';
import {FileDropItem, FocusRing, mergeProps, TextDropItem, useButton, useClipboard, useDrag} from 'react-aria';
import {FileTrigger} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import {Meta} from '@storybook/react';
import React, {useState} from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {SpectrumDropZoneProps} from '../src/DropZone';
import Upload from '@spectrum-icons/illustrations/Upload';

type StoryArgs = SpectrumDropZoneProps;

const meta: Meta<StoryArgs> = {
  title: 'DropZone',
  component: DropZone
};

export default meta;

export const withDraggable = {
  render: (args) => (
    <DropZoneWithDraggable {...args} />
  )
};

export const withLink = {
  render: (args) => (
    <DropZoneWithLink {...args} />
  )
};

export const withButton = {
  render: (args) => (
    <DropZoneWithButton {...args} />
  )
};

export const customBannerMessage = {
  render: (args) => (
    <Example 
      {...args}
      bannerMessage="This is a custom message" />
  )
};

export const acceptsMultiple = {
  render: (args) => (
    <Example {...args} />
  )
};

function Example(props) {
  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState(null);
  
  return (
    <DropZone 
      {...props}
      isFilled={isFilled}
      onDrop={async (e) => { 
        let items = e.items.filter((item) => item.kind === 'file') as FileDropItem[];
        if (items) {
          const urls = await Promise.all(items.map(async (item) => URL.createObjectURL(await item.getFile())));
          const stringUrls = urls.map((url) => url.toString());
          setFilledSrc(stringUrls);
          setIsFilled(true);
        }
      }}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} 
      onPaste={async (e) => { 
        let items = e.items.filter((item) => item.kind === 'file') as FileDropItem[];
        if (items) {
          const urls = await Promise.all(items.map(async (item) => URL.createObjectURL(await item.getFile())));
          const stringUrls = urls.map((url) => url.toString());
          setFilledSrc(stringUrls);
          setIsFilled(true);
        }
      }}>
      <IllustratedMessage>
        <Upload />
        <Heading>Drag a file here</Heading>
        <Content>
          <FileTrigger
            allowsMultiple
            onChange={(e) => {
              let files = Array.from(e);
              let urls = files.map(file => URL.createObjectURL(file));
              setFilledSrc(urls);
              setIsFilled(true);
            }}>
            <Button variant={'accent'}>Browse</Button>
          </FileTrigger>
        </Content>
      </IllustratedMessage>
      {isFilled && <img alt="test" style={{width: '100px', position: 'absolute'}} src={filledSrc[0]} />}
    </DropZone>
  );
}

function DropZoneWithDraggable(props) {
  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState(null);

  return (
    <>
      <Draggable />
      <DropZone 
        {...props}
        isFilled={isFilled}
        onDrop={async (e) => {
          let items = await Promise.all(e.items.filter((item) => item.kind === 'text' && item.types.has('text/plain')).map((item: TextDropItem) => item.getText('text/plain')));
          setIsFilled(!!items);
          setFilledSrc(items.join('\n'));
        }}
        onDropEnter={action('onDropEnter')}
        onDropExit={action('onDropExit')} 
        onPaste={action('onPaste')}>
        <IllustratedMessage>
          <Upload />
          <Heading>Drag and Drop here</Heading>
        </IllustratedMessage>
        {isFilled && <div style={{width: '100px', position: 'absolute'}}>{filledSrc}</div>}
      </DropZone>
    </>
  );
}

function DropZoneWithLink(props) {
  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState(null);

  return (
    <DropZone 
      {...props}
      isFilled={isFilled}
      onDrop={async (e) => { 
        let item = e.items.find((item) => item.kind === 'file') as FileDropItem;
        if (item) {
          setFilledSrc(URL.createObjectURL(await item.getFile()));
        }
      }}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} 
      onPaste={action('onPaste')}>
      <IllustratedMessage>
        <Upload />
        <Heading>Drag and Drop here</Heading>
        <Content>
          <FileTrigger
            onChange={(e) => {
              let files = Array.from(e);
              let urls = files.map(file => URL.createObjectURL(file));
              setFilledSrc(urls[0]);
              setIsFilled(true);
            }}>
            <Link>Select a file</Link> from your computer
          </FileTrigger>
        </Content>
      </IllustratedMessage>
      {isFilled && <img style={{width: '100px', position: 'absolute'}} src={filledSrc} alt="test" />}
    </DropZone>
  );
}

function DropZoneWithButton(props) {
  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState(null);

  return (
    <DropZone 
      {...props}
      isFilled={isFilled}
      onDrop={async (e) => { 
        let item = e.items.find((item) => item.kind === 'file') as FileDropItem;
        if (item) {
          setFilledSrc(URL.createObjectURL(await item.getFile()));
        }
      }}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} 
      onPaste={action('onPaste')}>
      <IllustratedMessage>
        <Upload />
        <Heading>Drag and Drop here</Heading>
        <Content>
          <FileTrigger
            onChange={(e) => {
              let files = Array.from(e);
              let urls = files.map(file => URL.createObjectURL(file));
              setFilledSrc(urls[0]);
              setIsFilled(true);
            }}>
            <Button variant={'accent'}>Browse</Button>
          </FileTrigger>
        </Content>
      </IllustratedMessage>
      {isFilled && <img style={{width: '100px', position: 'absolute'}} src={filledSrc} alt="test" />}
    </DropZone>
  );
}

function Draggable() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    },
    onDragStart: action('onDragStart'),
    // onDragMove: action('onDragMove'),
    onDragEnd: action('onDragEnd')
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });

  let ref = React.useRef();
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
      <div
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}
        className={classNames(dndStyles, 'draggable', {'is-dragging': isDragging})}>
        <ShowMenu size="XS" />
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}
