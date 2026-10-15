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

import React, {JSX, useRef, useState} from 'react';
import {ToastContainer} from './Example';
import {ToastState, ToastStateProps} from 'react-stately/useToastState';

export default {
  title: 'useToast',
  args: {
    maxVisibleToasts: 1,
    timeout: null
  },
  argTypes: {
    timeout: {
      control: 'radio',
      options: [null, 5000] as const
    }
  }
};

let count = 0;

interface DefaultProps extends ToastStateProps {
  timeout?: number;
}

export function Default(props: DefaultProps): JSX.Element {
  let {timeout, ...otherProps} = props;

  let ref = useRef<ToastState<string>>(null);

  return (
    <div>
      <button onClick={() => ref.current!.add('Mmmmm toast ' + ++count, {timeout})}>
        Add toast
      </button>
      <ToastContainer {...otherProps} ref={ref} />
    </div>
  );
}

export function ToastShownAgainWhileExiting(): JSX.Element {
  let ref = useRef<ToastState<string>>(null);
  let [archived, setArchived] = useState<string | null>(null);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Save", then press Tab to focus "Archive"</li>
        <li>Move the mouse onto the "Saved" toast and press Enter. "Archived" replaces it.</li>
        <li>Move the mouse away and press Enter again while "Saved" is still fading out</li>
        <li>"Saved" should close after 5 seconds</li>
      </ol>
      <button onClick={() => ref.current!.add('Saved', {timeout: 5000})}>Save</button>{' '}
      <button
        onClick={() => {
          if (archived) {
            ref.current!.close(archived);
          } else {
            setArchived(
              ref.current!.add('Archived', {timeout: 5000, onClose: () => setArchived(null)})
            );
          }
        }}>
        {archived ? 'Undo' : 'Archive'}
      </button>
      <ToastContainer maxVisibleToasts={1} isAnimated ref={ref} />
    </div>
  );
}

export function ToastExitingWithFocus(): JSX.Element {
  let ref = useRef<ToastState<string>>(null);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Add toast" twice</li>
        <li>Press Tab twice to reach the newest toast's ×, then press Enter</li>
        <li>Focus should move to the other toast while the closed one fades out</li>
      </ol>
      <button
        onClick={() =>
          ref.current!.add(ref.current!.visibleToasts.length ? 'Second toast' : 'First toast')
        }>
        Add toast
      </button>
      <ToastContainer maxVisibleToasts={5} isAnimated ref={ref} />
    </div>
  );
}
