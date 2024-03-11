import {keyframes} from '../style-macro/style-macro' with {type: 'macro'};
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipRenderProps
} from 'react-aria-components';
import {ReactNode, forwardRef} from 'react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {UnsafeStyles, centerPadding} from './style-utils' with {type: 'macro'};

export interface TooltipProps extends Omit<AriaTooltipProps, 'children' | 'className' | 'style'>, UnsafeStyles {
  children: ReactNode
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
    type: 'translate',
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
    type: 'translate',
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

function Tooltip(props: TooltipProps, ref: DOMRef<HTMLDivElement>) {
  let {children, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);
  return (
    <AriaTooltip
      {...props}
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

let _Tooltip = forwardRef(Tooltip);
export {_Tooltip as Tooltip};

