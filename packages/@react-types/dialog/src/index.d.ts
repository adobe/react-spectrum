import {DOMProps, StyleProps} from '@react-types/shared';
import {PositionProps} from '@react-types/overlays';
import {ReactElement, ReactNode, RefObject} from 'react';
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

export interface SpectrumDialogProps extends DOMProps, StyleProps {
  children: ReactNode
  slots?: Slots
}


export interface SpectrumAlertDialog extends DOMProps, StyleProps {
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
