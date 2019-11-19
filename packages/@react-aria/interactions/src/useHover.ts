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
  isHovering: boolean,
  ignoreEmulatedMouseEvents: boolean,
  target: HTMLElement | null
}

interface HoverResult {
  isHovering: boolean,
  hoverProps: HTMLAttributes<HTMLElement>
}

let blahBlah = false
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

  let ref = useRef<HoverState>({
    isHovering: false,
    target: null
  });

  let hoverProps = useMemo(() => {
    let state = ref.current;

    let triggerHoverStart = (event, pointerType) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        return;
      }

      let hoverTarget = event.target;

      if (onHoverStart) {
        onHoverStart({
          type: 'hoverstart',
          hoverTarget,
          pointerType
        });
      }

/*
      if (onHover) {
        onHover({
          type: 'hover',
          hoverTarget,
          pointerType
        });
      }
*/

      if (onHover) {
        /*
        let hoverShowDelay = setTimeout(() => {
          onHover({
            type: 'hover',
            hoverTarget,
            pointerType
          });
        }, 500)
        console.log("start target", event.target)
        console.log("start related target", event.relatedTarget)
        */

        handleMouseOverOut(handleDelayedShow(onHover, event), event)


      }

      // not working for some reason
      // setHover(true);
    };



    let triggerHoverEnd = (event, pointerType, didHover=true) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        return;
      }

      let hoverTarget = event.target;

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          hoverTarget,
          pointerType
        });
      }

      // not working for some reason
      // setHover(false);

/*
      if (onHover && didHover) {
        onHover({
          type: 'hover',
          hoverTarget,
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
        //     hoverTarget,
        //     pointerType
        //   });
        //   */
        //
        //   sample()
        //
        //
        // }, 500)
        // // console.log("end target", event.target)
        // // console.log("end related target", event.relatedTarget) // is the tooltip!
        //


        handleMouseOverOut(handleDelayedHide(onHover, event), event)


      }


    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};

    if (typeof PointerEvent !== 'undefined') {

      hoverProps.onPointerEnter = (e) => {
        state.isHovering = true
        // console.log(state.isHovering)
        if(state.isHovering) {
          triggerHoverStart(e, e.pointerType);
        }

      };

      hoverProps.onPointerLeave = (e) => {
        state.isHovering = false
        // console.log(state.isHovering)
        if(state.isHovering === false){
          triggerHoverEnd(e, e.pointerType);
        }

      };

    } else {

      hoverProps.onMouseEnter = (e) => {
        triggerHoverStart(e.target, 'mouse');
      };

      hoverProps.onMouseLeave = (e) => {
        triggerHoverEnd(e.target, 'mouse');
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

  console.log(blahBlah)

  hoverShowDelay = setTimeout(() => {
    onHover()
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

  if(blahBlah) { // this is not recognized until the next loop
    console.log("don't close")
  }

  hoverHideDelay = setTimeout(() => {
    onHover()
    console.log("handled delayed hide")
  }, 500);

}

function handleMouseOverOut(handler, e) {
  const target = e.currentTarget;
  console.log("target!!...", target)
  const related = e.relatedTarget || e.nativeEvent.toElement;
  console.log("related!!...", related)
  const parent = related.parentNode
  console.log("parent!!...", parent)
  if(parent.getAttribute('role') === "tooltip") {
    console.log("hi")
    blahBlah = true
    return; // why doesn't this block the handler from being called?
  }

  if (!related || related !== target && !target.contains(related)) { // this doesn't stop the tooltip from going away and isn't supposed to 
    console.log("handler triggered!!...")
    handler
  }
}
