// import Focus from 'react-events/focus';
// export {Focus};

import {chain} from '@react-aria/utils';
import React, {ReactElement, useEffect, useRef} from 'react';

let isGlobalFocusVisible = false;
let hasSetupGlobalListeners = false;

const isMac =
  typeof window !== 'undefined' && window.navigator != null
    ? /^Mac/.test(window.navigator.platform)
    : false;

function setupGlobalFocusEvents() {
  if (hasSetupGlobalListeners) {
    return;
  }

  let onKeyboardEvent = (e) => {
    if (
      e.key === 'Tab' &&
      !(
        e.metaKey ||
        (!isMac && e.altKey) ||
        e.ctrlKey
      )
    ) {
      isGlobalFocusVisible = true;
    }
  };

  let onPointerEvent = () => {
    isGlobalFocusVisible = false;
  };

  document.addEventListener('keydown', onKeyboardEvent, true);
  document.addEventListener('keyup', onKeyboardEvent, true);

  document.addEventListener('mousedown', onPointerEvent, true);
  document.addEventListener('mouseup', onPointerEvent, true);

  hasSetupGlobalListeners = true;
}

interface FocusProps {
  children?: ReactElement,
  onFocusChange?: (isFocused: boolean) => void,
  onFocusVisibleChange?: (isFocusVisible: boolean) => void,
  onFocusWithinChange?: (isFocusVisible: boolean) => void,
  onFocusVisibleWithinChange?: (isFocusVisible: boolean) => void
}

export function Focus({children, onFocusChange, onFocusVisibleChange, onFocusWithinChange, onFocusVisibleWithinChange}: FocusProps) {
  let stateRef = useRef({
    isFocused: false,
    isFocusVisible: false,
    isFocusWithin: false
  });
  let state = stateRef.current;

  let onFocus = (e) => {
    if (!state.isFocusWithin) {
      state.isFocusWithin = true;
      if (onFocusWithinChange) {
        onFocusWithinChange(true);
      }

      if (isGlobalFocusVisible && !state.isFocusVisible && onFocusVisibleWithinChange) {
        onFocusVisibleWithinChange(true);
      }
    }

    if (!state.isFocused && e.currentTarget === e.target) {
      state.isFocused = true;
      if (onFocusChange) {
        onFocusChange(true);
      }

      if (isGlobalFocusVisible && onFocusVisibleChange) {
        onFocusVisibleChange(true);
      }
    }

    state.isFocusVisible = isGlobalFocusVisible;
  };

  let onBlur = () => {
    if (state.isFocused) {
      state.isFocused = false;
      if (onFocusChange) {
        onFocusChange(false);
      }

      if (state.isFocusVisible && onFocusVisibleChange) {
        onFocusVisibleChange(false);
      }
    }

    if (state.isFocusWithin) {
      state.isFocusWithin = false;
      if (onFocusWithinChange) {
        onFocusWithinChange(false);
      }

      if (state.isFocusVisible && onFocusVisibleWithinChange) {
        onFocusVisibleWithinChange(false);
      }
    }

    state.isFocusVisible = false;
  };

  let onMouseDown = () => {
    if (state.isFocusVisible && !isGlobalFocusVisible) {
      state.isFocusVisible = false;
      if (state.isFocused && onFocusVisibleChange) {
        onFocusVisibleChange(false);
      }

      if (state.isFocusWithin && onFocusVisibleWithinChange) {
        onFocusVisibleWithinChange(false);
      }
    }
  };

  useEffect(() => {
    setupGlobalFocusEvents();
  }, []);

  let child = React.Children.only(children);
  return React.cloneElement(child, {
    onFocus: chain(child.props.onFocus, onFocus),
    onBlur: chain(child.props.onBlur, onBlur),
    onMouseDown: chain(child.props.onMouseDown, onMouseDown)
  });
}
