import {centerPadding, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {DOMRef} from '@react-types/shared';
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipRenderProps,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerComponentProps as AriaTooltipTriggerComponentProps
} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface TooltipTriggerProps extends Omit<AriaTooltipTriggerComponentProps, 'children' | 'closeDelay'>, Pick<AriaTooltipProps, 'shouldFlip' | 'containerPadding' | 'offset' | 'crossOffset'> {
  /** The content of the tooltip. */
  children?: ReactNode,
  /**
   * The placement of the element with respect to its anchor element.
   *
   * @default 'top'
   */
  placement?: 'start' | 'end' | 'right' | 'left' | 'top' | 'bottom'
}

export interface TooltipProps extends Omit<AriaTooltipProps, 'children' | 'className' | 'style' | 'triggerRef' | 'UNSTABLE_portalContainer'>, UnsafeStyles {
  /** The content of the tooltip. */
  children?: ReactNode
}

const slide = keyframes(`
  from {
    transform: translate(var(--originX), var(--originY));
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
`);

const tooltip = style<TooltipRenderProps>({
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: 160,
  minHeight: 24,
  boxSizing: 'border-box',
  color: {
    default: 'gray-25',
    forcedColors: 'ButtonText'
  },
  borderWidth: {
    forcedColors: 1
  },
  borderStyle: {
    forcedColors: 'solid'
  },
  borderColor: {
    forcedColors: 'transparent'
  },
  backgroundColor: 'neutral',
  borderRadius: 'control',
  fontFamily: 'sans',
  fontWeight: 'normal',
  fontSize: 'ui-sm',
  paddingX: 'edge-to-text',
  paddingY: centerPadding(),
  margin: 8,
  animation: {
    isEntering: slide,
    isExiting: slide
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
  '--originX': {
    type: 'marginTop',
    value: {
      placement: {
        top: 0,
        bottom: 0,
        left: 4,
        right: -4
      }
    }
  },
  '--originY': {
    type: 'marginTop',
    value: {
      placement: {
        top: 4,
        bottom: -4,
        left: 0,
        right: -0
      }
    }
  }
});

const arrowStyles = style<TooltipRenderProps>({
  display: 'block',
  fill: 'gray-800',
  rotate: {
    placement: {
      top: 0,
      bottom: '180deg',
      left: '-90deg',
      right: '90deg'
    }
  },
  translate: {
    placement: {
      left: '[-25%]',
      right: '[25%]'
    }
  }
});

let InternalTooltipTriggerContext = createContext<TooltipTriggerProps>({});

function Tooltip(props: TooltipProps, ref: DOMRef<HTMLDivElement>) {
  let {children, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);
  let {
    containerPadding,
    crossOffset,
    offset,
    placement = 'top',
    shouldFlip
  } = useContext(InternalTooltipTriggerContext);

  return (
    <AriaTooltip
      {...props}
      containerPadding={containerPadding}
      crossOffset={crossOffset}
      offset={offset}
      placement={placement}
      shouldFlip={shouldFlip}
      ref={domRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + tooltip({...renderProps})}>
      {renderProps => (
        <>
          <OverlayArrow>
            <svg className={arrowStyles(renderProps)} xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5">
              <path d="M4.29289 4.29289L0 0H10L5.70711 4.29289C5.31658 4.68342 4.68342 4.68342 4.29289 4.29289Z" />
            </svg>
          </OverlayArrow>
          {children}
        </>
      )}
    </AriaTooltip>
  );
}

function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    containerPadding,
    crossOffset,
    offset,
    placement,
    shouldFlip,
    ...triggerProps
  } = props;

  return (
    <AriaTooltipTrigger {...triggerProps}>
      <InternalTooltipTriggerContext.Provider
        value={{
          containerPadding: containerPadding,
          crossOffset: crossOffset,
          offset: offset,
          placement: placement,
          shouldFlip: shouldFlip
        }}>
        {props.children}
      </InternalTooltipTriggerContext.Provider>
    </AriaTooltipTrigger>
  );
}

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing
 * the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip
 * relative to the trigger.
 */
let _TooltipTrigger = forwardRef(TooltipTrigger);
export {_TooltipTrigger as TooltipTrigger};


/**
 * Display container for Tooltip content. Has a directional arrow dependent on its placement.
 */
let _Tooltip = forwardRef(Tooltip);
export {_Tooltip as Tooltip};


// This is purely so that storybook generates the types for both Menu and MenuTrigger
interface ICombined extends Omit<TooltipProps, 'placement'>, TooltipTriggerProps {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CombinedTooltip(props: ICombined) {
  return <div />;
}
