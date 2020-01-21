import {DOMProps, StyleProps} from '@react-types/shared';
import {PositionProps} from '@react-types/overlays';
import {ReactElement, ReactNode, RefObject} from 'react';

export interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  isDisabled?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export interface SpectrumTooltipProps extends DOMProps, StyleProps {
  children: ReactNode,
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  placement?: 'right' | 'left' | 'top' | 'bottom',
  isOpen?: boolean,
  role?: 'tooltip'
}
