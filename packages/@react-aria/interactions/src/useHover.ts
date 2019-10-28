import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {mergeProps} from '@react-aria/utils';
import {HoverResponderContext} from './hoverContext';

export interface HoverEvent {
  type: 'hoverstart' | 'hoverend' | 'hovering',
  target: HTMLElement
}

export interface HoverProps {
  isHovering?: boolean,
  onHover?: (e: HoverEvent) => void,
  onHoverStart?: (e:HoversEvent) => void,
  onHoverEnd?: (e: HoverEvent) => void,
  onHoverChange?: (isHovering: boolean) => void
}

export interface HoverHookProps extends HoverProps, DOMProps {
  ref?: RefObject<HTMLElement>
}

interface HoverState {
  isHovering: boolean,
  activePointerId: any,
  target: HTMLElement | null,
  isOverTarget: boolean
}

function useHoverResponderContext(props: HoverHookProps): HoverHookProps {
  // Consume context from <HoverResponder> and merge with props.
  let context = useContext(HoverResponderContext);
  if (context) {
    console.log("hover has context") // called
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

interface HoverResult {
  isHovering: boolean,
  hoverProps: HTMLAttributes<HTMLElement>
}


export function useHover(props: HoverHookProps): HoverResult {

  let {
    onHover,
    onHoverChange,
    onHoverStart,
    onHoverEnd,
    isHovering: isHoveringProp,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref: _, // Removing `ref` from `domProps` because TypeScript is dumb
    ...domProps
  } = useHoverResponderContext(props);

  let [isHovering, setHover] = useState(false);
  let ref = useRef<HoverState>({
    isHovering: false,
    activePointerId: null,
    target: null,
    isOverTarget: false
  });


  let hoverProps = useMemo(() => {

    let state = ref.current;

    console.log(state)

    let triggerHoverStart = (target) => {

      if (onHoverStart) {
        onHoverStart({
          type: 'hoverstart',
          target
        });
      }

      if (onHoverChange) {
        onHoverChange(true);
      }

      setHover(true);
    };

    let triggerHoverEnd = (target, wasHovered = true) => {

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target
        });
      }

      if (onHoverChange) {
        onHoverChange(false);
      }

      setHover(false);

      if (onHover && wasHovered) {
        onHover({
          type: 'hovering',
          target
        });
      }
    };



    let hoverProps: HTMLAttributes<HTMLElement> = {
      onMouseEnter(e) {
        if (!state.isHovering) {
          state.isHovering = true;
          triggerHoverStart(e.target);
          console.log("hover state triggered")
        }
      },
      onMouseLeave(e) {
        if (state.isHovering) {
          state.isHovering = false;
          triggerHoverEnd(e.target);
          console.log("hover state ended")
        }
      }
    };

    console.log(PointerEvent) // called


    hoverProps.onMouseEnter = (e) => {
      console.log("mouse enter")
      state.target = e.currentTarget;
      triggerHoverStart(e.target);
    };

    hoverProps.onMouseLeave = (e) => {
      console.log("mouse exit")
      triggerHoverEnd(e.target);
    };


    return hoverProps;
  }, [onHover, onHoverStart, onHoverEnd, onHoverChange]);


  return {
    isHovering: isHoveringProp || isHovering,
    hoverProps: mergeProps(domProps, hoverProps)
  };

}




//////////////////////



export function useHoverTestApproach() {

  const [value, setValue] = useState(false);
  const ref = useRef(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);

        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );

  return [ref, value];
}


// Usage

/*
import useHover from "./useHover";

function App() {
  const [hoverRef, isHovered] = useHover();

  return (
    <div ref={hoverRef}>
      {isHovered ? 'hovering' : 'not hovering'}
    </div>
  );
}
*/
