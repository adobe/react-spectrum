import {DOMProps, StyleProps} from '@react-types/shared';
import {PositionProps} from '@react-types/overlays';
import {ReactElement, ReactNode, RefObject} from 'react';

export interface SpectrumDialogTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'modal' | 'popover' | 'tray',
  mobileType?: 'modal' | 'tray',
  hideArrow?: boolean,
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export interface SpectrumDialogProps extends DOMProps, StyleProps {
  children: ReactNode
}
