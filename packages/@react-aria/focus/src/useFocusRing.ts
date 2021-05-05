import {HTMLAttributes, useEffect, useRef, useState} from 'react';
import {isFocusVisible, useFocus, useFocusVisible, useFocusWithin} from '@react-aria/interactions';

interface FocusRingProps {
  /**
   * Whether to show the focus ring when something
   * inside the container element has focus (true), or
   * only if the container itself has focus (false).
   * @default 'false'
   */
  within?: boolean,

  /** Whether the element is a text input. */
  isTextInput?: boolean,

  /** Whether the element will be auto focused. */
  autoFocus?: boolean
}

interface FocusRingAria {
  /** Whether the element is currently focused. */
  isFocused: boolean,

  /** Whether keyboard focus should be visible. */
  isFocusVisible: boolean,

  /** Props to apply to the container element with the focus ring. */
  focusProps: HTMLAttributes<HTMLElement>
}

type Handler = (visibility: boolean) => void;
let changeHandlers = new Set<Handler>(); // TODO type
/**
 * Determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard,
 * not with a mouse, touch, or other input methods.
 */
// export function useFocusRing(props: FocusRingProps = {}): FocusRingAria {
//   let {within} = props;
//   let [isFocused, setFocused] = useState(false);
//   let [isFocusWithin, setFocusWithin] = useState(false);
//   let {isFocusVisible} = useFocusVisible(props);
//   let {focusProps} = useFocus({
//     isDisabled: within,
//     onFocusChange: setFocused
//   });
//   let {focusWithinProps} = useFocusWithin({
//     isDisabled: !within,
//     onFocusWithinChange: setFocusWithin
//   });
//
//   return {
//     isFocused: within ? isFocusWithin : isFocused,
//     isFocusVisible: (within ? isFocusWithin : isFocused) && isFocusVisible,
//     focusProps: within ? focusWithinProps : focusProps
//   };
// }

export function useFocusRing(props: FocusRingProps = {}): FocusRingAria {
  let {within} = props;
  console.log('usefocusring')
  let [isFocused, setFocused] = useState(false);
  let [isFocusWithin, setFocusWithin] = useState(false);
  // let {add, del} = useFocusVisible();
  // // need to extract modality + set up listeners
  //
  //
  // let [focusVisible, setFocusVisible] = useState(false);
  // let lastKnownVisibleState = useRef(false);
  //
  // useEffect(() => {
  //   let currentValue = lastKnownVisibleState.current;
  //   function handleVisibilityChange(modality) {
  //     let visibility = modality !== 'pointer';
  //     // set the ref value
  //     currentValue = visibility;
  //     if (isFocused || (lastKnownVisibleState.current && !visibility)) {
  //       console.log('handlevischange')
  //       // force rerender
  //       setFocusVisible(currentValue);
  //     }
  //   }
  //   // subscribe to vis change
  //   console.log('add')
  //   // changeHandlers.add(handleVisibilityChange);
  //   add(handleVisibilityChange);
  //
  //   return () => {
  //     // unsubscribe to vis change
  //     console.log('del')
  //     // changeHandlers.delete(handleVisibilityChange);
  //     del(handleVisibilityChange);
  //   };
  // }, [isFocused]);
  //
  // // let currentValue = lastKnownVisibleState.current;
  // // function handleVisibilityChange(visibility: boolean) {
  // //   // set the ref value
  // //   currentValue = visibility;
  // //   if (isFocused) {
  // //     // force rerender
  // //     setFocusVisible(currentValue);
  // //   }
  // // }
  // // useFocusVisible({cb: handleVisibilityChange});
  //
  // let {focusProps} = useFocus({
  //   isDisabled: within,
  //   onFocusChange: (focusChange) => {
  //     console.log('focus change', focusChange)
  //     setFocused(focusChange);
  //     console.log('focus visible?', focusChange && isFocusVisible());
  //     // setFocusVisible(focusChange && isFocusVisible());
  //   }
  // });
  // let {focusWithinProps} = useFocusWithin({
  //   isDisabled: !within,
  //   onFocusWithinChange: setFocusWithin
  // });
  //
  // return {
  //   isFocused: within ? isFocusWithin : isFocused,
  //   isFocusVisible: (within ? isFocusWithin : isFocused) && focusVisible,
  //   focusProps: within ? focusWithinProps : focusProps
  // };
  return {
    isFocused: false, //within ? isFocusWithin : isFocused,
    isFocusVisible: (within ? isFocusWithin : isFocused) && isFocusVisible,
    isFocusVisible: false, //(within ? isFocusWithin : isFocused) && false,
    focusProps: {} //within ? focusWithinProps : focusProps
  };
}
