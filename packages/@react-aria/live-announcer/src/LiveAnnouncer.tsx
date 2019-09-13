import React, {Fragment, useImperativeHandle, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {VisuallyHidden} from '@react-aria/visually-hidden';

/* Inspired by https://github.com/AlmeroSteyn/react-aria-live */
let liveRegionAnnouncer = React.createRef();
let node = null;
let clearTimeoutId = null;
const LIVEREGION_TIMEOUT_DELAY = 1000;

export function announce(message, assertiveness = 'assertive', timeout = LIVEREGION_TIMEOUT_DELAY) {
  ensureInstance(announcer => announcer.announce(message, assertiveness, timeout));
}

export function clearAnnouncer(assertiveness) {
  ensureInstance(announcer => announcer.clear(assertiveness));
}

export function destroyAnnouncer() {
  if (liveRegionAnnouncer.current) {
    ReactDOM.unmountComponentAtNode(node);
    document.body.removeChild(node);
    node = null;
  }
}

function ensureInstance(callback) {
  if (!liveRegionAnnouncer.current) {
    node = document.createElement('div');
    document.body.appendChild(node);
    ReactDOM.render(
      <LiveRegionAnnouncer ref={liveRegionAnnouncer} />,
      node,
      () => callback(liveRegionAnnouncer.current)
    );
  } else {
    callback(liveRegionAnnouncer.current);
  }
}

const LiveRegionAnnouncer = React.forwardRef((props, ref) => {
  let [assertiveMessage, setAssertiveMessage] = useState('');
  let [politeMessage, setPoliteMessage] = useState('');

  let clear = (assertiveness) => {
    if (!assertiveness || assertiveness === 'assertive') {
      setAssertiveMessage('');
    }

    if (!assertiveness || assertiveness === 'polite') {
      setPoliteMessage('');
    }
  };

  let announce = (message, assertiveness = 'assertive', timeout = LIVEREGION_TIMEOUT_DELAY) => {
    if (clearTimeoutId) {
      clearTimeout(clearTimeoutId);
      clearTimeoutId = null;
    }

    if (assertiveness === 'assertive') {
      setAssertiveMessage(message);
    } else {
      setPoliteMessage(message);
    }

    if (message !== '') {
      clearTimeoutId = setTimeout(() => {
        clear(assertiveness);
      }, timeout);
    }
  };

  useImperativeHandle(ref, () => ({
    announce,
    clear
  }));

  return (
    <Fragment>
      <MessageAlternator aria-live="assertive" message={assertiveMessage} />
      <MessageAlternator aria-live="polite" message={politeMessage} />
    </Fragment>
  );
});

function MessageAlternator({message = '', 'aria-live': ariaLive}) {
  let messagesRef = useRef(['', '']);
  let indexRef = useRef(0);

  if (message !== messagesRef.current[indexRef.current]) {
    messagesRef.current[indexRef.current] = '';
    indexRef.current = (indexRef.current + 1) % 2;
    messagesRef.current[indexRef.current] = message;
  }

  return (
    <Fragment>
      <MessageBlock aria-live={ariaLive} message={messagesRef.current[0]} />
      <MessageBlock aria-live={ariaLive} message={messagesRef.current[1]} />
    </Fragment>
  );
}

function MessageBlock({message = '', 'aria-live': ariaLive}) {
  return (
    <VisuallyHidden
      aria-live={ariaLive}
      aria-relevant="additions"
      aria-atomic="true">
      {message}
    </VisuallyHidden>
  );
}
