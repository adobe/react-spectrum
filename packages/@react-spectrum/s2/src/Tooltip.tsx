import {keyframes} from '../style-macro/style-macro' with {type: 'macro'};
import {mergeStyles} from '../style-macro/runtime';
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipRenderProps
} from 'react-aria-components';
import React, {useRef} from 'react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
  className?: string,
  children: React.ReactNode
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
  maxWidth: 40,
  minHeight: 6,
  color: {
    default: 'gray-25',
    forcedColors: 'GrayText'
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
  fontSize: 'sm',
  paddingX: 'edge-to-text',
  '--labelPadding': {
    type: 'paddingTop',
    value: '[calc((self(minHeight) - 1lh) / 2)]'
  },
  margin: 2,
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
    isExiting: 'ease-in'
  },
  '--originX': {
    type: 'translate',
    value: {
      placement: {
        top: 0,
        bottom: 0,
        left: 1,
        right: '[-0.25rem]' // TODO update with negatives from Dialog PR
      }
    }
  },
  '--originY': {
    type: 'translate',
    value: {
      placement: {
        top: 1,
        bottom: '[-0.25rem]', // TODO update with negatives from Dialog PR
        left: 0,
        right: -0
      }
    }
  }
});

const iconStyles = style<TooltipRenderProps>({
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
      left: '[-2.5px]',
      right: '[2.5px]'
    }
  }
});

export function Tooltip({children, ...props}: TooltipProps) {
  let ref = useRef(null);
  return (
    <AriaTooltip
      {...props}
      ref={ref}
      className={renderProps => mergeStyles(props.className, tooltip({...renderProps}))}>
      {renderProps => (
        <>
          <OverlayArrow>
            <svg className={iconStyles(renderProps)} xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5">
              <path d="M4.29289 4.29289L0 0H10L5.70711 4.29289C5.31658 4.68342 4.68342 4.68342 4.29289 4.29289Z" />
            </svg>
          </OverlayArrow>
          <div className={style({paddingY: '--labelPadding'})()}>
            {children}
          </div>
        </>
      )}
    </AriaTooltip>
  );
}
