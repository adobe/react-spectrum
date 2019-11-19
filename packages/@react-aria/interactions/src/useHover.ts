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
        let hoverShowDelay = setTimeout(() => {
          onHover({
            type: 'hover',
            hoverTarget,
            pointerType
          });
        }, 500)
        console.log("start target", event.target)
        console.log("start related target", event.relatedTarget) // didn't get the tooltip to show here but it's clear you still need to use chaining
      }


      // not working for some reason
      // setHover(true);
    };





    let triggerHoverEnd = (target, pointerType, didHover=true) => {
      if (isDisabled) {
        return;
      }

      if (pointerType === 'touch') {
        return;
      }

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target,
          pointerType
        });
      }

      // not working for some reason
      // setHover(false);

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
        //   sample()
        //
        //
        // }, 500)
        // // console.log("end target", target.target)
        // // console.log("end related target", target.relatedTarget) // is the tooltip!
        //

        console.log("hi")

        callFirst(onHover)

        // handleMouseOverOut(onHover, target)


      }




      // sample()


    };

    let hoverProps: HTMLAttributes<HTMLElement> = {};

    if (typeof PointerEvent !== 'undefined') {

      hoverProps.onPointerEnter = (e) => {
        state.isHovering = true
        console.log(state.isHovering)
        if(state.isHovering) {
          triggerHoverStart(e, e.pointerType); // can just pass e
        }

      };

      hoverProps.onPointerLeave = (e) => {
        state.isHovering = false
        console.log(state.isHovering)
        if(state.isHovering === false){
          triggerHoverEnd(e, e.pointerType); // can just pass e
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


//triggerProps.onMouseOver = this.handleMouseOverOut.bind(this, this.handleDelayedShow);
//triggerProps.onMouseOut = this.handleMouseOverOut.bind(this, this.handleDelayedHide);
//onKeyDown: chain(triggerProps.onKeyDown, onKeyDownTrigger)

let sample = chain(callFirst, callSecond) // this worked


function callFirst(funcAarg) {  // this worked 
  console.log("I'm first!")
  funcAarg()
}

function callSecond() {
  console.log("I'm second!")
}




// give the animation some extra time on the screen so that the related target can be picked up
function handleDelayedShow(e) {
  let hoverShowDelay = setTimeout(() => {
    console.log("handle dealyed show")
  }, 500);
}

// give the user some time to hover over the tooltip before it disapears
function handleDelayedHide(e) {
  let hoverHideDelay = setTimeout(() => {
    console.log("handle delayed hide")
  }, 500);
}

function handleMouseOverOut(handler, e) {
  const target1 = e.currentTarget;
  console.log("target!!!!!!!", target1)
  const related1 = e.relatedTarget || e.nativeEvent.toElement;
  console.log("related!!!!!!!", related1)

  if (!related1 || related1 !== target1 && !target1.contains(related1)) {
    console.log("true....!")
    handler(); // handler(e)
  }
}
