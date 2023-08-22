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
import {Draggable} from '@react-aria/dnd/stories/dnd.stories';
import {DropZone} from '../';
import {FileDropItem, TextDropItem, useDrag} from 'react-aria';
import {FileTrigger, Text} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Meta} from '@storybook/react';
import React, {useState} from 'react';
import {SpectrumDropZoneProps} from '../src/DropZone';
import styles from './styles.css';
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

export const withButton = {
  render: (args) => (
    <DropZoneWithButton {...args} />
  )
};

export const customBannerMessage = {
  render: (args) => (
    <Example 
      {...args}
      replaceMessage="This is a custom message" />
  )
};

export const acceptsMultiple = {
  render: (args) => (
    <Example {...args} />
  )
};

export const filledDropzone = {
  render: (args) => (
    <DropZoneFilled {...args} />
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
        if (items.length > 0) {
          const urls = await Promise.all(items.map(async (item) => URL.createObjectURL(await item.getFile())));
          const stringUrls = urls.map((url) => url.toString());
          setFilledSrc(stringUrls);
          setIsFilled(true);
        }
      }}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} 
      onPaste={action('onPaste')}>
      <IllustratedMessage>
        <Upload />
        <Heading>
          <Text slot="heading">
            Drag a file here
          </Text>
        </Heading>
        <Content>
          <FileTrigger
            allowsMultiple
            onChange={(e) => {
              let files = Array.from(e);
              let urls = files.map(file => URL.createObjectURL(file));
              setFilledSrc(urls);
              setIsFilled(true);
            }}>
            <Button variant="primary">Select a file</Button>
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
          if (items.length > 0) {
            setIsFilled(true);
            setFilledSrc(items.join('\n'));
          }
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
          setIsFilled(true);
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
            <Button variant="primary">Select a file</Button>
          </FileTrigger>
        </Content>
      </IllustratedMessage>
      {isFilled && <img style={{width: '100px', position: 'absolute'}} src={filledSrc} alt="test" />}
    </DropZone>
  );
}

function DropZoneFilled(props) {
  let [isFilled, setIsFilled] = useState(true);
  let [filledSrc, setFilledSrc] = useState('https://i.imgur.com/DhygPot.jpg');

  return (
    <>
      <DraggableImage />
      <DropZone
        {...props}
        isFilled={isFilled}
        UNSAFE_className={classNames(styles, 'is-filled')}
        width="size-3000"
        height="size-2400"
        getDropOperation={(types) =>  (types.has('image/png') || types.has('image/jpeg')) ? 'copy' : 'cancel'}
        onDrop={async (e) => {
          e.items.find(async (item) => {
            if (item.kind === 'file') {
              if (item.type === 'image/jpeg' || item.type === 'image/png') {
                setFilledSrc(URL.createObjectURL(await item.getFile()));
                setIsFilled(true);
              }
            } else if (item.kind === 'text') {
              setFilledSrc(await item.getText('image/jpeg'));
              setIsFilled(true);
            }
          });
        }}
        onDropEnter={action('onDropEnter')}
        onDropExit={action('onDropExit')} 
        onPaste={action('onPaste')}>
        {!isFilled && 
          <IllustratedMessage>
            <Upload />
            <Heading>Drag and Drop here</Heading>
          </IllustratedMessage>
        }
        <img className={styles.images} alt="a starry sky" src={filledSrc} />
      </DropZone>
    </>
  );
}

function DraggableImage() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [
        {
          'image/jpeg': 'https://i.imgur.com/Z7AzH2c.jpg'
        }
      ];
    }
  });

  return (
    <div
      {...dragProps}
      role="button"
      tabIndex={0}
      style={{margin: '20px'}}>
      <img
        width="150px"
        height="100px"
        alt="traditional roof"
        src="https://i.imgur.com/Z7AzH2c.jpg"
        className={`draggable ${isDragging ? 'dragging' : ''}`} />
    </div>
  );
}
