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
import {Button, DropZone, FileTrigger, Link, Text} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import React, {useRef} from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

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

const DropzoneWithRenderPropsExample = (props) => (
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
      {({isHovered, isFocused, isFocusVisible, isDropTarget, isDisabled}) => (
        <div>
          <Text slot="label">
            DropzoneArea
          </Text>
          <div>isHovered: {isHovered ? 'true' : 'false'}</div>
          <div>isFocused: {isFocused ? 'true' : 'false'}</div>
          <div>isFocusVisible: {isFocusVisible ? 'true' : 'false'}</div>
          <div>isDropTarget: {isDropTarget ? 'true' : 'false'}</div>
          <div>isDisabled: {isDisabled ? 'true' : 'false'}</div>
        </div>
      )}
    </DropZone>
  </div>
);

export const DropzoneWithRenderProps = {
  args: {
    isDisabled: false
  },
  argTypes: {
    isDisabled: {control: 'boolean'}
  },
  render: (args) => (
    <DropzoneWithRenderPropsExample {...args} />
  )
};

const Draggable = () => {
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
};

const Copyable = () => {
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
};
