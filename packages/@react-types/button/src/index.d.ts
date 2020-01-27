import {DOMProps, FocusableProps, HoverEvents, PressEvents, StyleProps} from '@react-types/shared'; // 1TODO: change to HoverableProps ?
import {JSXElementConstructor, ReactElement, ReactNode} from 'react';

export interface ButtonProps extends DOMProps, StyleProps, PressEvents, HoverEvents, FocusableProps { // 1TODO: change to HoverableProps ?
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
  holdAffordance?: boolean
}

export interface SpectrumLogicButtonProps extends ButtonProps {
  variant: 'and' | 'or'
}
