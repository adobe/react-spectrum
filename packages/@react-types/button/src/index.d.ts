import {DOMProps, FocusableProps, MultipleSelection} from '@react-types/shared';
import {JSXElementConstructor, ReactElement, ReactNode} from 'react';
import {PressProps} from '@react-aria/interactions';
import {StyleProps} from '@react-spectrum/view';

export interface ButtonBase extends DOMProps, StyleProps, PressProps, FocusableProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  icon?: ReactElement,
  children?: ReactNode,
  href?: string
}

export interface ActionButtonProps extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  isEmphasized?: boolean,
  holdAffordance?: boolean
}

export type ButtonGroupButton = ReactElement<ActionButtonProps>;

export interface ButtonGroupProps extends DOMProps, StyleProps, MultipleSelection {
  orientation?: 'horizontal' | 'vertical',
  children: ButtonGroupButton | ButtonGroupButton[],
  isDisabled?: boolean
}
