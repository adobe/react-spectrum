import {PositionProps} from '@react-types/overlays';
import {ReactElement, RefObject} from 'react';

export interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  isDisabled?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}
