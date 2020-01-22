import {DOMProps, FocusableProps, MultipleSelection, PressEvents, StyleProps} from '@react-types/shared';
import {JSXElementConstructor, ReactElement, ReactNode} from 'react';

export interface ButtonProps extends DOMProps, StyleProps, PressEvents, FocusableProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  children?: ReactNode,
  href?: string
}

export interface SpectrumButtonProps extends ButtonProps {
  icon?: ReactElement,
  variant: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  isQuiet?: boolean
}

export interface SpectrumActionButtonProps extends ButtonProps {
  icon?: ReactElement,
  isQuiet?: boolean,
  isSelected?: boolean,
  isEmphasized?: boolean,
  holdAffordance?: boolean
}

export type ButtonGroupButton = ReactElement<SpectrumActionButtonProps>;

export interface ButtonGroupProps extends DOMProps, StyleProps, MultipleSelection {
  orientation?: 'horizontal' | 'vertical',
  children: ButtonGroupButton | ButtonGroupButton[],
  isDisabled?: boolean
}

export interface SpectrumButtonGroupProps extends ButtonGroupProps {
  isEmphasized?: boolean,
  isConnected?: boolean
  isJustified?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  onSelectionChange?: (...args) => void
}

export interface SpectrumLogicButtonProps extends ButtonProps {
  variant: 'and' | 'or'
}
