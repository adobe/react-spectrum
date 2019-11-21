import {DOMProps} from '@react-types/shared';
import {HoverResponderContext} from './hoverContext';
import {HTMLAttributes, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {mergeProps} from '@react-aria/utils';
import {chain} from '@react-aria/utils';

export interface HoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hover',
  pointerType: 'mouse' | 'touch' | 'pen' | 'keyboard',
  target: HTMLElement
}

export interface HoverProps {
  isHovering?: boolean,
  isDisabled?: boolean,
  onHover?: (e: HoverEvent) => void,
  onHoverStart?: (e: HoverEvent) => void,
  onHoverEnd?: (e: HoverEvent) => void
}

export interface HoverHookProps extends HoverProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface HoverState {
  ignoreEmulatedMouseEvents: boolean,
  target: HTMLElement | null
}

interface HoverResult {
  isHovering: boolean,
  hoverProps: HTMLAttributes<HTMLElement>
}

let hoverHideDelay = null
let hoverShowDelay = null

function useHoverResponderContext(props: HoverHookProps): HoverHookProps {
  // Consume context from <HoverResponder> and merge with props.
  let context = useContext(HoverResponderContext);
  if (context) {
    let {register, ...contextProps} = context;
    props = mergeProps(contextProps, props) as HoverHookProps;
    register();
  }

   // Sync ref from <HoverResponder> with ref passed to useHover.
  useEffect(() => {
    if (context && context.ref) {
      context.ref.current = props.ref.current;
      return () => {
        context.ref.current = null;
      };
    }
  }, [context, props.ref]);

  return props;
}

export function useHover(props: HoverHookProps): HoverResult {

  let {
    onHover,
    onHoverStart,
    onHoverEnd,
    isDisabled,
    isHovering: isHoveringProp,
    ...domProps
  } = useHoverResponderContext(props);

  let [isHovering, setHover] = useState(false);

  // when refs update they don't trigger a re-render
  let ref = useRef<HoverState>({
    ignoreEmulatedMouseEvents: false,
    target: null
  });


  let hoverProps = useMemo(() => {
    let state = ref.current;

    let triggerHoverStart = (event, pointerType) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        state.ignoreEmulatedMouseEvents = true;
        return;
      }

      let target = event.target;

      if (onHoverStart) {
        onHoverStart({
          type: 'hoverstart',
          target,
          pointerType
        });
      }

/*
      if (onHover) {
        onHover({
          type: 'hover',
          target,
          pointerType
        });
      }
*/


      if (onHover) {
        /*
        let hoverShowDelay = setTimeout(() => {
          onHover({
            type: 'hover',
            target,
            pointerType
          });
        }, 500)
        console.log("start target", event.target)
        console.log("start related target", event.relatedTarget)
        */

        handleDelayedShow(onHover, event)


      }


      setHover(true);
    };



    let triggerHoverEnd = (event, pointerType, didHover=true) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        state.ignoreEmulatedMouseEvents = true;
        return;
      }

      let target = event.target;

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target,
          pointerType
        });
      }

      setHover(false);

/*
      if (onHover && didHover) {
        onHover({
          type: 'hover',
          target,
          pointerType
        });
      }
*/

      if (onHover && didHover) {

        //
        // let hoverHideDelay = setTimeout(() => {
        //
        //   /*
        //   onHover({
        //     type: 'hover',
        //     target,
        //     pointerType
        //   });
        //   */
        //
        //
        //
        // }, 500)
        // // console.log("end target", event.target)
        // // console.log("end related target", event.relatedTarget) // is the tooltip!
        //

        handleMouseOverOut(onHover, event) // this worked to freeze when over tooltip ...

      }

    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};

    if (typeof PointerEvent !== 'undefined') {

      hoverProps.onPointerEnter = (e) => {
        triggerHoverStart(e, e.pointerType);
        // DEVON FEEDBACK: don't toggle, just set to true
      };

      hoverProps.onPointerLeave = (e) => {
        triggerHoverEnd(e, e.pointerType);
        // DEVON FEEDBACK: don't toggle, just set to false
      };

    } else {

      hoverProps.onMouseEnter = (e) => {
        triggerHoverStart(e, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        triggerHoverEnd(e, 'mouse');
      };

    }

    return hoverProps;
  }, [onHover, onHoverStart, onHoverEnd, isDisabled]);

  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };
}

// give the animation some extra time on the screen so that the related target can be picked up
function handleDelayedShow(onHover, e) {

  if(hoverHideDelay != null) {
    clearTimeout(hoverHideDelay);
    hoverHideDelay = null;
    console.log("block 1")
  }

  hoverShowDelay = setTimeout(() => {
    onHover(true)
    console.log("handled dealyed show")
  }, 500);
}

// give the user some time to hover over the tooltip before it disapears
function handleDelayedHide(onHover, e) {

  if(hoverShowDelay != null) {
    clearTimeout(hoverShowDelay);
    hoverShowDelay = null;
    console.log("block 2")
  }

  hoverHideDelay = setTimeout(() => {
    onHover(false)
    console.log("handled delayed hide")
  }, 500);

}

// DEVON FEEDBACK: create a seperate hook for the tooltip .... it needs its own recognition

function handleMouseOverOut(onHover, e) {
  const target = e.currentTarget;
  console.log("target!!...", target)
  const related = e.relatedTarget || e.nativeEvent.toElement;
  console.log("related!!...", related)
  const parent = related.parentNode
  console.log("parent!!...", parent)
  if(parent.getAttribute('role') === "tooltip") { // add in the other checks -> if (!related || related !== target && !target.contains(related)) {}
    console.log("hi")
    return
  } else {
    hoverHideDelay = setTimeout(() => {
      onHover()
      console.log("handled delayed hide")
    }, 500);
  }

}
