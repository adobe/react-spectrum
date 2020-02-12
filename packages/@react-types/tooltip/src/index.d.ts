import {DOMProps, StyleProps} from '@react-types/shared';
import {PositionProps} from '@react-types/overlays';
import {ReactElement, ReactNode, RefObject} from 'react';

export interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click' | 'hover',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  isDisabled?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export interface TooltipProps extends DOMProps {
  children: ReactNode,
  isOpen?: boolean,
  role?: 'tooltip',
  ref: RefObject<HTMLElement | null>
}

export interface SpectrumTooltipProps extends TooltipProps, StyleProps {
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  placement?: 'right' | 'left' | 'top' | 'bottom'
}
