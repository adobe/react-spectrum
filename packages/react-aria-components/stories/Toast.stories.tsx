/*
 * Copyright 2026 Adobe. All rights reserved.
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
import {Meta} from '@storybook/react';
import React, {useState} from 'react';
import {Text} from '../src/Text';
import {
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion
} from '../src/Toast';
import {ToastQueue} from 'react-stately/useToastState';
import './styles.css';

export default {
  title: 'React Aria Components/Toast',
  component: Toast
} as Meta<typeof Toast>;

export function ToastHoveredAfterTimeout() {
  let [queue] = useState(() => new ToastQueue<string>());

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>In Safari or Firefox, press "Add toast", then "Freeze for 6 seconds"</li>
        <li>While the page is frozen, move the mouse onto the toast</li>
        <li>Once the page responds again, move the mouse away. The toast should close.</li>
      </ol>
      <Button onPress={() => queue.add('Saved', {timeout: 5000})}>Add toast</Button>{' '}
      <Button
        onPress={() => {
          let end = Date.now() + 6000;
          while (Date.now() < end) {
            // Keep the main thread busy.
          }
        }}>
        Freeze for 6 seconds
      </Button>
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}

export function ToastAddedWhilePaused() {
  let [queue] = useState(() => new ToastQueue<string>());
  let [isEditing, setEditing] = useState(false);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Edit", which pauses toasts while editing, then "Add toast"</li>
        <li>Wait 5 seconds without moving the mouse onto the toast</li>
        <li>The toast should stay open until you press "Done"</li>
      </ol>
      {isEditing ? (
        <>
          <Button onPress={() => queue.add('Saved', {timeout: 5000})}>Add toast</Button>{' '}
          <Button
            onPress={() => {
              setEditing(false);
              queue.resumeAll();
            }}>
            Done
          </Button>
        </>
      ) : (
        <Button
          onPress={() => {
            setEditing(true);
            queue.pauseAll();
          }}>
          Edit
        </Button>
      )}
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}

export function ToastResumedBeforeRender() {
  let [queue] = useState(() => new ToastQueue<string>());
  let [isEditing, setEditing] = useState(false);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Edit", which pauses toasts while editing, then "Save"</li>
        <li>Move the mouse onto the "Saved" toast and keep it there</li>
        <li>The toast should stay open while hovered</li>
      </ol>
      {isEditing ? (
        <Button
          onPress={() => {
            queue.add('Saved', {timeout: 5000});
            setEditing(false);
            queue.resumeAll();
          }}>
          Save
        </Button>
      ) : (
        <Button
          onPress={() => {
            setEditing(true);
            queue.pauseAll();
          }}>
          Edit
        </Button>
      )}
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}

export function ToastFocusReturnsToRegion() {
  let [queue] = useState(() => new ToastQueue<string>());

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Add toast", press Tab to move into the toast, then Shift+Tab to move back</li>
        <li>Press Enter to add a second toast</li>
        <li>Press Tab twice to reach its ×, then press Enter</li>
        <li>Focus should move to the first toast</li>
      </ol>
      <Button
        onPress={() => queue.add(queue.visibleToasts.length ? 'Second toast' : 'First toast')}>
        Add toast
      </Button>
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}

export function ToastAddedInFrontOfFocused() {
  let [queue] = useState(() => new ToastQueue<string>());

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Add toast", then "Add toast in 3 seconds"</li>
        <li>Press Tab twice to reach the toast's ×</li>
        <li>Once the second toast appears, press Enter</li>
        <li>Focus should move to the second toast</li>
      </ol>
      <Button onPress={() => queue.add('First toast')}>Add toast</Button>{' '}
      <Button onPress={() => setTimeout(() => queue.add('Second toast'), 3000)}>
        Add toast in 3 seconds
      </Button>
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}

export function ToastClosedAfterFocusFromPage() {
  let [queue] = useState(() => new ToastQueue<string>());

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>
          Press "Add toast, then another in 8 seconds", click an empty spot on the page, then click
          the toast's text
        </li>
        <li>Click the toast's ×, then move the mouse away from it</li>
        <li>
          When the second toast appears, don't click anything. It should close after 5 seconds.
        </li>
      </ol>
      <Button
        onPress={() => {
          queue.add('First toast');
          setTimeout(() => queue.add('Second toast', {timeout: 5000}), 8000);
        }}>
        Add toast, then another in 8 seconds
      </Button>
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}

export function ToastFocusPulledBack() {
  let [queue] = useState(() => new ToastQueue<string>({maxVisibleToasts: 1}));

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Start", click into the text field, then click the toast's text</li>
        <li>When the toast changes to "Replacement", focus returns to the text field</li>
        <li>When "First toast" comes back, the text field should still have focus</li>
      </ol>
      <Button
        onPress={() => {
          queue.add('First toast');
          setTimeout(() => {
            let key = queue.add('Replacement');
            setTimeout(() => queue.close(key), 4000);
          }, 5000);
        }}>
        Start
      </Button>{' '}
      <input aria-label="Notes" />
      <ToastRegion queue={queue} style={{position: 'fixed', bottom: 16, right: 16}}>
        {({toast}) => (
          <Toast
            toast={toast}
            style={{
              display: 'flex',
              gap: 16,
              padding: 16,
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              borderRadius: 4
            }}>
            <ToastContent>
              <Text slot="title">{toast.content}</Text>
            </ToastContent>
            <Button slot="close">×</Button>
          </Toast>
        )}
      </ToastRegion>
    </div>
  );
}
