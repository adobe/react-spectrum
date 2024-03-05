import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
  PopoverRenderProps
} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {keyframes} from '../style-macro/style-macro' with {type: 'macro'};


export interface PopoverProps extends Omit<AriaPopoverProps, 'arrowSize' | 'isNonModal' | 'arrowBoundaryOffset' | 'isKeyboardDismissDisabled' | 'shouldCloseOnInteractOutside' | 'shouldUpdatePosition'> {
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
  backgroundColor: 'layer-2',
  padding: 2,
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
        isArrowShown: 1.5 // TODO: not defined yet should this change with font size? need boolean support for 'hideArrow' prop
      },
      top: {
        // @ts-ignore
        isArrowShown: -1.5
      }
    }
  },
  translateX: {
    placement: {
      left: {
        // @ts-ignore TODO: why is the type not working?
        isArrowShown: -1.5
      },
      right: {
        isArrowShown: 1.5
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
});
// TODO: animations and real Popover Arrow

let arrow = style({
  display: 'block',
  fill: 'layer-2',
  rotate: {
    default: 180,
    placement: {
      top: 0,
      bottom: 180,
      left: -90,
      right: 90
    }
  }
});

export function Popover(props: PopoverProps) {
  let {
    hideArrow = false
  } = props;

  return (
    <AriaPopover
      {...props}
      className={(renderProps) => popover({...renderProps, isArrowShown: !hideArrow})}>
      {composeRenderProps(props.children, (children, renderProps) => (
        <>
          {!hideArrow && (
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12" className={arrow(renderProps)}>
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>
      ))}
    </AriaPopover>
  );
}
