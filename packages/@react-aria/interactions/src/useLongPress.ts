import { useRef, RefObject } from "react";
import {usePress, PressProps} from "./usePress";
import { PressEvent } from "@react-types/shared";

export interface LongPressHookProps extends PressProps {
  /** A ref to the target element. */
  ref?: RefObject<HTMLElement>
  onLongPress: (e: PressEvent) => void
  triggerThreshold?: number
}


export function useLongPress(props : LongPressHookProps) {
  let {
    onLongPress,
    triggerThreshold
  } = props;
  
  triggerThreshold = triggerThreshold || 500

  const timeRef = useRef(null);

  let { pressProps } = usePress({
    onPressStart(e) {
      if(timeRef.current) {
        clearTimeout(timeRef.current)
      }
      timeRef.current = setTimeout(() => {
        onLongPress(e);
        timeRef.current = null;
      }, triggerThreshold);
    },
    onPressEnd() { 
     if(timeRef.current) {
      clearTimeout(timeRef.current)
     }
    },
  });
  
  return pressProps;
}
