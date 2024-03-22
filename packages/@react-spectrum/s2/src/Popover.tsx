import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
  PopoverRenderProps
} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {forwardRef} from 'react';
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';

export interface PopoverProps extends Omit<AriaPopoverProps, 'arrowSize' | 'isNonModal' | 'arrowBoundaryOffset' | 'isKeyboardDismissDisabled' | 'shouldCloseOnInteractOutside' | 'shouldUpdatePosition' | 'className' | 'style'>, StyleProps {
  /**
   * Whether a popover's arrow should be hidden.
   *
   * @default false
   */
  hideArrow?: boolean
}

const fadeKeyframes = keyframes(`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`);
const slideUpKeyframes = keyframes(`
  from {
    transform: translateY(-4px);
  }

  to {
    transform: translateY(0);
  }
`);
const slideDownKeyframes = keyframes(`
  from {
    transform: translateY(4px);
  }

  to {
    transform: translateY(0);
  }
`);
const slideRightKeyframes = keyframes(`
  from {
    transform: translateX(4px);
  }

  to {
    transform: translateX(0);
  }
`);
const slideLeftKeyframes = keyframes(`
  from {
    transform: translateX(-4px);
  }

  to {
    transform: translateX(0);
  }
`);

let popover = style<PopoverRenderProps & {isArrowShown: boolean}>({
  '--popoverBackground': {
    type: 'backgroundColor',
    value: 'layer-2'
  },
  backgroundColor: '--popoverBackground',
  borderRadius: 'lg',
  filter: 'elevated-light',
  borderStyle: {
    forcedColors: 'solid'
  },
  borderColor: {
    forcedColors: 'ButtonBorder'
  },
  translateY: {
    placement: {
      bottom: {
        isArrowShown: 8 // TODO: not defined yet should this change with font size? need boolean support for 'hideArrow' prop
      },
      top: {
        isArrowShown: -8
      }
    }
  },
  translateX: {
    placement: {
      left: {
        isArrowShown: -8
      },
      right: {
        isArrowShown: 8
      }
    }
  },
  animation: {
    placement: {
      top: {
        isEntering: `${slideDownKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideDownKeyframes}, ${fadeKeyframes}`
      },
      bottom: {
        isEntering: `${slideUpKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideUpKeyframes}, ${fadeKeyframes}`
      },
      left: {
        isEntering: `${slideRightKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideRightKeyframes}, ${fadeKeyframes}`
      },
      right: {
        isEntering: `${slideLeftKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideLeftKeyframes}, ${fadeKeyframes}`
      }
    }
  },
  animationDuration: {
    isEntering: 200,
    isExiting: 200
  },
  animationDirection: {
    isEntering: 'normal',
    isExiting: 'reverse'
  },
  animationTimingFunction: {
    isExiting: 'in'
  },
  transition: '[opacity, transform]',
  willChange: '[opacity, transform]'
}, getAllowedOverrides());
// TODO: animations and real Popover Arrow

let arrow = style({
  display: 'block',
  fill: '--popoverBackground',
  rotate: {
    default: 180,
    placement: {
      top: 0,
      bottom: 180,
      left: -90,
      right: 90
    }
  },
  translateX: {
    placement: {
      left: -4,
      right: 4
    }
  }
});

function Popover(props: PopoverProps, ref: DOMRef<HTMLDivElement>) {
  let {
    hideArrow = false,
    UNSAFE_className = '',
    UNSAFE_style,
    styles
  } = props;
  let domRef = useDOMRef(ref);

  // TODO: this still isn't the final popover 'tip', copying various ones out of the Figma files yields different results
  return (
    <AriaPopover
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={(renderProps) => UNSAFE_className + popover({...renderProps, isArrowShown: !hideArrow}, styles)}>
      {composeRenderProps(props.children, (children, renderProps) => (
        <>
          {!hideArrow && (
            <OverlayArrow>
              <svg width={16} height={8} viewBox="0 0 16 8" className={arrow(renderProps)}>
                <path d="M0 0L6.93799 7.52588C7.07224 7.67448 7.23607 7.79362 7.41895 7.87524C7.60182 7.95687 7.79973 7.9993 8 8C8.19984 7.99882 8.39724 7.95606 8.57959 7.87427C8.76194 7.79248 8.9253 7.67336 9.05908 7.5249L16 0L0 0Z" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>
      ))}
    </AriaPopover>
  );
}

/**
 * A popover is an overlay element positioned relative to a trigger.
 */
let _Popover = forwardRef(Popover);
export {_Popover as Popover};
