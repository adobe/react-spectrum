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
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import {classNames} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {Draggable} from '@react-aria/dnd/stories/dnd.stories';
import {DropEvent, FileDropItem, TextDropItem, useDrag} from 'react-aria';
import {DropZone} from '../';
import File from '@spectrum-icons/illustrations/File';
import {FileTrigger} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Meta} from '@storybook/react';
import NotFound from '@spectrum-icons/illustrations/NotFound';
import React, {useState} from 'react';
import {SpectrumDropZoneProps} from '../src/DropZone';
import styles from './styles.css';
import Upload from '@spectrum-icons/illustrations/Upload';

interface FileFilledSource {
  src?: string,
  id?: number,
  type: string,
  name: string
}

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

export const customAriaLabel = {
  render: (args) => (
    <DropZoneWithDraggable
      {...args}
      aria-label="custom label" />
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

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <NotFound />
      <Heading>No files</Heading>
      <Content>No files selected</Content>
    </IllustratedMessage>
  );
}

function Example(props) {
  let columns = [
    {name: 'Name', uid: 'name'},
    {name: 'Type', uid: 'type'}
  ];

  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState<Iterable<FileFilledSource> | undefined>(undefined);

  return (
    <>
      <DropZone
        {...props}
        width="size-3000"
        height="size-3000"
        isFilled={isFilled}
        onDrop={async (e) => {
          let items = e.items.filter((item) => item.kind === 'file') as FileDropItem[];
          if (items.length > 0) {
            const rows = items.map((item, index) => ({name: item.name, type: item.type, id: index} as FileFilledSource));
            setFilledSrc(rows);
            setIsFilled(true);
          }
        }}
        onDropEnter={action('onDropEnter')}
        onDropExit={action('onDropExit')}
        onPaste={action('onPaste')}>
        <IllustratedMessage>
          <Upload />
          <Heading>
            Drag a file here
          </Heading>
          <Content>
            <FileTrigger
              allowsMultiple
              onSelect={(e: FileList | null) => {
                let files = Array.from(e || []);
                let rows = files.map((file, index) => ({name: file.name, type: file.type, id: index} as FileFilledSource));
                setFilledSrc(rows);
                setIsFilled(true);
              }}>
              <Button variant="primary">Select a file</Button>
            </FileTrigger>
          </Content>
        </IllustratedMessage>
      </DropZone>
      <TableView
        renderEmptyState={renderEmptyState}
        height="size-3000"
        minWidth="size-3000">
        <TableHeader columns={columns}>
          {column => (
            <Column
              key={column.uid}>
              {column.name}
            </Column>)}
        </TableHeader>
        {isFilled ?
          <TableBody items={filledSrc}>
            {item => (
              <Row>
                {columnKey => <Cell>{item[columnKey]}</Cell>}
              </Row>
            )}
          </TableBody> :
          <TableBody>
            {[]}
          </TableBody>
        }
      </TableView>
    </>
  );
}

function DropZoneWithDraggable(props) {
  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState<string | null>(null);

  return (
    <>
      <Draggable />
      <DropZone
        {...props}
        isFilled={isFilled}
        onDrop={async (e: DropEvent) => {
          let items = await Promise.all(e.items.filter((item) => item.kind === 'text' && item.types.has('text/plain')).map((item) => (item as TextDropItem).getText('text/plain')));
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
          <Heading>
            Drag and Drop here
          </Heading>
        </IllustratedMessage>
        {filledSrc}
      </DropZone>
    </>
  );
}

function DropZoneWithButton(props) {
  let [isFilled, setIsFilled] = useState(false);
  let [filledSrc, setFilledSrc] = useState<FileFilledSource | null>(null);

  return (
    <>
      <DropZone
        {...props}
        width="size-3000"
        height="size-3000"
        isFilled={isFilled}
        UNSAFE_className={classNames(styles, isFilled && 'is-filled')}
        onDrop={async (e) => {
          let item = e.items.find((item) => item.kind === 'file') as FileDropItem;
          if (item) {
            setFilledSrc({
              src: URL.createObjectURL(await item.getFile()),
              type: item.type,
              name: item.name});
            setIsFilled(true);
          }
        }}
        onDropEnter={action('onDropEnter')}
        onDropExit={action('onDropExit')}
        onPaste={action('onPaste')}>
        <IllustratedMessage>
          <Upload />
          <Heading>
            Drag and Drop here
          </Heading>
          <Content>
            <FileTrigger
              onSelect={(e) => {
                let files = Array.from(e || []);
                let src = files.map(file => URL.createObjectURL(file));
                let type = files.map(file => file.type);
                let name = files.map(file => file.name);
                setFilledSrc({
                  src: src[0],
                  type: type[0],
                  name: name[0]});
                setIsFilled(true);
              }}>
              <Button variant="primary">Select a file</Button>
            </FileTrigger>
          </Content>
        </IllustratedMessage>
      </DropZone>
      {isFilled &&
        <div className={styles.files}>
          <File />
          {filledSrc?.name}
        </div>}
    </>
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
