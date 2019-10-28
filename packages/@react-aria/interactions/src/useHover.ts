import {useEffect, useRef, useState} from 'react';
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
    console.log("hover has context") // does not run 
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

    let triggerHoverStart = (target, pointerType) => {

      if (onHoverStart) {
        onHoverStart({
          type: 'hoverstart',
          target,
          pointerType
        });
      }

      if (onHoverChange) {
        onHoverChange(true);
      }

      setHover(true);
    };

    let triggerHoverEnd = (target, pointerType, wasHovered = true) => {

      if (onHoverEnd) {
        onHoverEnd({
          type: 'hoverend',
          target,
          pointerType
        });
      }

      if (onHoverChange) {
        onHoverChange(false);
      }

      setHover(false);

      if (onPress && wasHovered) {
        onPress({
          type: 'press',
          target,
          pointerType
        });
      }
    };

    if (typeof PointerEvent !== 'undefined') {

      pressProps.onPointerEnter = (e) => {
        console.log("hovering")
      };

      pressProps.onPointerLeave = (e) => {
        console.log("not hovering")
      };

    } else {

      pressProps.onMouseEnter = (e) => {
        console.log("mouse enter")
      };

      pressProps.onMouseLeave = (e) => {
        console.log("mouse exit")
      };

    }

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
