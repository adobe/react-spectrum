/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {Button, Checkbox, Dialog, DialogTrigger, DropZone, FileTrigger, Input, Label, Link, Modal, ModalOverlay, Radio, RadioGroup, SearchField, Switch, Text, TextField, ToggleButton, Toolbar} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import React, {useRef} from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

function Draggable() {
  let buttonRef = useRef(null);
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'}];
    }
  });
  let {buttonProps} = useButton({elementType: 'div'}, buttonRef);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(buttonProps, dragProps)}
        ref={buttonRef}
        className={classNames(styles, 'draggable', {['dragging']: isDragging})}>
        Drag me
      </div>
    </FocusRing>
  );
}

function Copyable() {
  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...clipboardProps}
        role="textbox"
        aria-label="copyable element"
        tabIndex={0}
        className={styles.copyable}>
        Copy me
      </div>
    </FocusRing>
  );
}

export const DropzoneExampleWithFileTriggerLink = (props) => (
  <div>
    <DropZone
      {...props}
      aria-label={'testing aria-label'}
      className={styles.dropzone}
      data-testid="drop-zone-example-with-file-trigger-link"
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')}>
      <FileTrigger onSelect={action('onSelect')}>
        <Link>Upload</Link>
      </FileTrigger>
    </DropZone>
  </div>
);

export const DropzoneExampleWithFileTriggerButton = (props) => (
  <div>
    <DropZone
      {...props}
      className={styles.dropzone}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')}>
      <FileTrigger onSelect={action('onSelect')} >
        <Button>Upload</Button>
      </FileTrigger>
    </DropZone>
  </div>
);

export const DropzoneExampleWithDraggableAndFileTrigger = (props) => (
  <div>
    <Draggable />
    <DropZone
      {...props}
      className={styles.dropzone}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')}>
      <FileTrigger onSelect={action('onSelect')} >
        <Button>Browse</Button>
      </FileTrigger>
      Or drag into here
    </DropZone>
  </div>
);

export const DropZoneOnlyAcceptPNGWithFileTrigger = (props) => (
  <div>
    <DropZone
      {...props}
      getDropOperation={(types) =>  types.has('image/png') ? 'copy' : 'cancel'}
      className={styles.dropzone}
      onPress={action('OnPress')}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')} >
      <FileTrigger onSelect={action('onSelect')} acceptedFileTypes={['image/png']}>
        <Button>Upload</Button>
      </FileTrigger>
    </DropZone>
  </div>
);

export const DropZoneWithCaptureMobileOnly = (props) => (
  <div>
    <DropZone
      {...props}
      getDropOperation={(types) =>  types.has('image/png') ? 'copy' : 'cancel'}
      className={styles.dropzone}
      onPress={action('OnPress')}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')} >
      <FileTrigger onSelect={action('onSelect')} defaultCamera="environment">
        <Button>Upload</Button>
      </FileTrigger>
    </DropZone>
  </div>
);

export const DropzoneExampleWithDraggableObject = (props) => (
  <div>
    <Draggable />
    <DropZone
      {...props}
      className={styles.dropzone}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')} >
      <Text slot="label">
        DropZone Area
      </Text>
    </DropZone>
  </div>
);

export const DropzoneExampleWithCopyableObject = (props) => (
  <div>
    <Copyable />
    <DropZone
      {...props}
      className={styles.dropzone}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')}>
      <Text slot="label">
        DropZone Area
      </Text>
    </DropZone>
  </div>
);

export const DropzoneWithRenderProps = (props) => (
  <div>
    <Draggable />
    <Copyable />
    <DropZone
      {...props}
      className={styles.dropzone}
      onPress={action('OnPress')}
      onDrop={action('OnDrop')}
      onDropEnter={action('OnDropEnter')}
      onDropExit={action('OnDropExit')}>
      {({isHovered, isFocused, isFocusVisible, isDropTarget}) => (
        <div>
          <Text slot="label">
            DropzoneArea
          </Text>
          <div>isHovered: {isHovered ? 'true' : 'false'}</div>
          <div>isFocused: {isFocused ? 'true' : 'false'}</div>
          <div>isFocusVisible: {isFocusVisible ? 'true' : 'false'}</div>
          <div>isDropTarget: {isDropTarget ? 'true' : 'false'}</div>
        </div>
      )}
    </DropZone>
  </div>
);

export const FileTriggerButton = (props) => (
  <FileTrigger
    onSelect={action('onSelect')}
    data-testid="filetrigger-example"
    {...props} >
    <Button>Upload</Button>
  </FileTrigger>
);

export const FileTriggerDirectories = (props) => {
  let [files, setFiles] = React.useState<string[]>([]);

  return (
    <>
      <FileTrigger
        {...props}
        acceptDirectory
        onSelect={(e) => {
          if (e) {
            let fileList = [...e].map(file => file.webkitRelativePath !== '' ? file.webkitRelativePath : file.name);
            setFiles(fileList);
          }
        }} >
        <Button>Upload</Button>
      </FileTrigger>
      {files && <ul>
        {files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>}
    </>
  );
};

export const FileTriggerLinkAllowsMultiple = (props) => (
  <FileTrigger
    {...props}
    onSelect={action('onSelect')}
    allowsMultiple >
    <Link>Select a file</Link>
  </FileTrigger>
);
export const RadioGroupExample = () => {
  return (
    <RadioGroup
      data-testid="radio-group-example"
      className={styles.radiogroup}>
      <Label>Favorite pet</Label>
      <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
      <Radio className={styles.radio} value="cats">Cat</Radio>
      <Radio className={styles.radio} value="dragon">Dragon</Radio>
    </RadioGroup>
  );
};

export const RadioGroupInDialogExample = () => {
  return (
    <DialogTrigger>
      <Button>Open dialog</Button>
      <ModalOverlay
        style={{
          position: 'fixed',
          zIndex: 100,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Modal
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 30
          }}>
          <Dialog
            style={{
              outline: '2px solid transparent',
              outlineOffset: '2px',
              position: 'relative'
            }}>
            {({close}) => (
              <>
                <div>
                  <RadioGroupExample />
                </div>
                <div>
                  <Button onPress={close} style={{marginTop: 10}}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

export const SearchFieldExample = () => {
  return (
    <SearchField className={classNames(styles, 'searchFieldExample')} data-testid="search-field-example">
      <Label>Search</Label>
      <Input />
      <Button>✕</Button>
    </SearchField>
  );
};

export const ButtonExample = () => {
  return (
    <Button data-testid="button-example" onPress={() => alert('Hello world!')}>Press me</Button>
  );
};

export const ToggleButtonExample = () => {
  return (
    <ToggleButton className={classNames(styles, 'toggleButtonExample')} data-testid="toggle-button-example">Toggle</ToggleButton>
  );
};

export const SwitchExample = () => {
  return (
    <Switch className={classNames(styles, 'switchExample')} data-testid="switch-example">
      <div className={classNames(styles, 'switchExample-indicator')} />
      Switch me
    </Switch>
  );
};

export const TextfieldExample = () => {
  return (
    <TextField data-testid="textfield-example">
      <Label>First name</Label>
      <Input />
    </TextField>
  );
};

export const LinkExample = () => {
  return (
    <Link data-testid="link-example"href="https://www.imdb.com/title/tt6348138/" target="_blank">
      The missing link
    </Link>
  );
};

export const ToolbarExample = (props) => {
  return (
    <div>
      <label htmlFor="before">Input Before Toolbar</label>
      <input id="before" type="text" />
      <Toolbar {...props}>
        <div role="group" aria-label="Text style">
          <ToggleButton className={classNames(styles, 'toggleButtonExample')}><strong>B</strong></ToggleButton>
          <ToggleButton className={classNames(styles, 'toggleButtonExample')}><div style={{textDecoration: 'underline'}}>U</div></ToggleButton>
          <ToggleButton className={classNames(styles, 'toggleButtonExample')}><i>I</i></ToggleButton>
        </div>
        <Checkbox>
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <polyline points="1 9 7 14 15 4" />
            </svg>
          </div>
          Night Mode
        </Checkbox>
        <Link href="https://google.com">Help</Link>
      </Toolbar>
      <label htmlFor="after">Input After Toolbar</label>
      <input id="after" type="text" />
    </div>
  );
};

ToolbarExample.args = {
  orientation: 'horizontal'
};
ToolbarExample.argTypes = {
  orientation: {
    control: 'radio',
    options: ['horizontal', 'vertical']
  }
};
