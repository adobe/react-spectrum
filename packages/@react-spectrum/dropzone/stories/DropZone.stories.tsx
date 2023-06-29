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
import {Content} from '@react-spectrum/view';
import {DropZone} from '../';
import {FileDropItem} from 'react-aria';
import {FileTrigger} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import {Meta} from '@storybook/react';
import React, {useState} from 'react';
import {SpectrumDropZoneProps} from '../src/DropZone';
import Upload from '@spectrum-icons/illustrations/Upload';

type StoryArgs = SpectrumDropZoneProps;

const meta: Meta<StoryArgs> = {
  title: 'DropZone',
  component: DropZone
};

export default meta;

export const Default = {
  render: (args) => (
    <DropZone 
      {...args} 
      onDrop={action('onDrop')}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} >
      <IllustratedMessage>
        <Upload />
        <Heading>Drag and Drop your file</Heading>
        <Content>
          <FileTrigger
            onChange={action('onChange')}>
            <Link>Select a File</Link> from your computer
          </FileTrigger>
        </Content>
      </IllustratedMessage>
    </DropZone>
  )
};

export const DefaultWithButton = {
  render: (args) => (
    <DropZone 
      {...args} 
      onDrop={action('onDrop')}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} >
      <IllustratedMessage>
        <Upload />
        <Heading>Drag a file here</Heading>
        <Content>
          <FileTrigger
            onChange={action('onChange')}>
            <Button variant={'accent'}>Browse</Button>
          </FileTrigger>
        </Content>
      </IllustratedMessage>
    </DropZone>
  )
};

export const DefaultTest = {
  render: (args) => (
    <Example {...args} />
  )
};


function Example(props) {
  let [filledSrc, setFilledSrc] = useState(null);

  let isFilled = filledSrc !== null;
  
  return (
    <DropZone 
      {...props}
      filledSrc={filledSrc}

      // this will handle a single file
      // onDrop={async (e) => { 
      //   let item = e.items.find((item) => item.kind === 'file') as FileDropItem;
      //   if (item) {
      //     setFilledSrc(URL.createObjectURL(await item.getFile()));
      //   }
      // }}

      // this will handle multiple files
      onDrop={async (e) => { 
        let items = e.items.filter((item) => item.kind === 'file') as FileDropItem[];
        items.map(item => console.log(item.type));
        if (items) {
          const urls = await Promise.all(items.map(async (item) => URL.createObjectURL(await item.getFile())));
          const stringUrls = urls.map((url) => url.toString());
          setFilledSrc(stringUrls);
        }
      }}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} >
      <IllustratedMessage>
        <Upload />
        <Heading>Drag a file here</Heading>
        <Content>
          <FileTrigger
            onChange={action('onChange')}>
            <Button variant={'accent'}>Browse</Button>
          </FileTrigger>
        </Content>
      </IllustratedMessage>
      {isFilled && <img alt="test" style={{width: '100px', position: 'absolute'}} src={filledSrc[0]} />}
    </DropZone>
  );
}
