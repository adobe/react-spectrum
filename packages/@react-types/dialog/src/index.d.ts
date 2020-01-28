import {DOMProps, StyleProps} from '@react-types/shared';
import {HTMLAttributes, ReactElement, ReactNode, RefObject} from 'react';
import {PositionProps} from '@react-types/overlays';
import {Slots} from '@react-types/layout';

export interface SpectrumDialogTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'modal' | 'popover' | 'tray',
  mobileType?: 'modal' | 'tray',
  hideArrow?: boolean,
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  isDismissable?: boolean
}

export interface SpectrumBaseDialogProps extends HTMLAttributes<HTMLElement> {
  slots?: Slots,
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
}

export interface SpectrumDialogProps extends DOMProps, StyleProps {
  children: ReactNode,
  slots?: Slots,
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  isDismissable?: boolean // adds close button and enables clicking on background
}


export interface SpectrumAlertDialogProps extends DOMProps, StyleProps {
  variant?: 'confirmation' | 'information' | 'destructive' | 'error', // warning?
  title: ReactNode,
  children: ReactNode,
  cancelLabel?: string,
  primaryLabel?: string,
  secondaryLabel?: string,
  isConfirmDisabled?: boolean,
  onCancel?: () => void,
  onConfirm?: (button: 'primary' | 'secondary') => void,
  autoFocusButton?: 'cancel' | 'primary' | 'secondary',
  allowsKeyboardConfirmation?: boolean, // triggers primary action
  isKeyboardCancelDisabled?: boolean // needed?
}
