/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, {Fragment, ReactNode, RefObject, useImperativeHandle, useState} from 'react';
import ReactDOM from 'react-dom';
import {useLayoutEffect} from '@react-aria/utils';
import {VisuallyHidden} from '@react-aria/visually-hidden';

// @ts-ignore
const isReactConcurrent = !!ReactDOM.createRoot;

type Assertiveness = 'assertive' | 'polite';
interface Announcer {
  announce(message: string, assertiveness: Assertiveness, timeout: number): void,
  clear(assertiveness: Assertiveness): void
}

/* Inspired by https://github.com/AlmeroSteyn/react-aria-live */
const LIVEREGION_TIMEOUT_DELAY = 7000;

let liveRegionAnnouncer = React.createRef<Announcer>();
let node: HTMLElement = null;
let messageId = 0;
let root: any = null;

/**
 * Announces the message using screen reader technology.
 */
export function announce(
  message: string,
  assertiveness: Assertiveness = 'assertive',
  timeout = LIVEREGION_TIMEOUT_DELAY
) {
  ensureInstance(announcer => announcer.announce(message, assertiveness, timeout));
}

/**
 * Stops all queued announcements.
 */
export function clearAnnouncer(assertiveness: Assertiveness) {
  ensureInstance(announcer => announcer.clear(assertiveness));
}

/**
 * Removes the announcer from the DOM.
 */
export function destroyAnnouncer() {
  if (liveRegionAnnouncer.current) {
    if (isReactConcurrent) {
      root.unmount();
    } else {
      ReactDOM.unmountComponentAtNode(node);
    }
    document.body.removeChild(node);
    node = null;
    root = null;
  }
}

/**
 * Ensures we only have one instance of the announcer so that we don't have elements competing.
 */
function ensureInstance(callback: (announcer: Announcer) => void) {
  if (!liveRegionAnnouncer.current) {
    node = document.createElement('div');
    node.dataset.liveAnnouncer = 'true';
    document.body.prepend(node);
    if (isReactConcurrent) {
      // @ts-ignore
      root = ReactDOM.createRoot(node);
      // https://github.com/reactwg/react-18/discussions/5
      root.render(
        // do we actually want the callback to be called during downtime? or after render in a useeffect?
        <LiveRegionAnnouncer ref={liveRegionAnnouncer} callback={() => callback(liveRegionAnnouncer.current)} />
      );
    } else {
      ReactDOM.render(
        <LiveRegionAnnouncer ref={liveRegionAnnouncer} />,
        node,
        () => callback(liveRegionAnnouncer.current)
      );
    }
  } else {
    callback(liveRegionAnnouncer.current);
  }
}

const LiveRegionAnnouncer = React.forwardRef((props: {callback?: () => void}, ref: RefObject<Announcer>) => {
  let {callback} = props;
  let [assertiveMessages, setAssertiveMessages] = useState([]);
  let [politeMessages, setPoliteMessages] = useState([]);

  let clear = (assertiveness: Assertiveness) => {
    if (!assertiveness || assertiveness === 'assertive') {
      setAssertiveMessages([]);
    }

    if (!assertiveness || assertiveness === 'polite') {
      setPoliteMessages([]);
    }
  };

  let announce = (message: string, assertiveness = 'assertive', timeout = LIVEREGION_TIMEOUT_DELAY) => {
    let id = messageId++;

    if (assertiveness === 'assertive') {
      setAssertiveMessages(messages => [...messages, {id, text: message}]);
    } else {
      setPoliteMessages(messages => [...messages, {id, text: message}]);
    }

    if (message !== '') {
      setTimeout(() => {
        if (assertiveness === 'assertive') {
          setAssertiveMessages(messages => messages.filter(message => message.id !== id));
        } else {
          setPoliteMessages(messages => messages.filter(message => message.id !== id));
        }
      }, timeout);
    }
  };

  useLayoutEffect(() => {
    if (callback) {
      callback();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    announce,
    clear
  }));

  return (
    <Fragment>
      <MessageBlock aria-live="assertive">
        {assertiveMessages.map(message => <div key={message.id}>{message.text}</div>)}
      </MessageBlock>
      <MessageBlock aria-live="polite">
        {politeMessages.map(message => <div key={message.id}>{message.text}</div>)}
      </MessageBlock>
    </Fragment>
  );
});

interface MessageBlockProps {
   children: ReactNode,
   'aria-live': Assertiveness
 }

function MessageBlock({children, 'aria-live': ariaLive}: MessageBlockProps) {
  return (
    <VisuallyHidden
      role="log"
      aria-live={ariaLive}
      aria-relevant="additions">
      {children}
    </VisuallyHidden>
  );
}
