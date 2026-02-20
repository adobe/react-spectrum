'use client';
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerComponentProps
} from 'react-aria-components';

import './Tooltip.css';

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
  children: React.ReactNode;
}

export function Tooltip({ children, ...props }: TooltipProps) {
  return (
    (
      <AriaTooltip {...props}>
        <OverlayArrow>
          <svg width={8} height={8} viewBox="0 0 8 8">
            <path d="M0 0 L4 4 L8 0" />
          </svg>
        </OverlayArrow>
        {children}
      </AriaTooltip>
    )
  );
}

export function TooltipTrigger(props: TooltipTriggerComponentProps) {
  return <AriaTooltipTrigger {...props} />;
}
