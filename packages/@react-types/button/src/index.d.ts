import {DOMProps, MultipleSelection} from '@react-types/shared';
import {JSXElementConstructor, ReactElement, ReactNode} from 'react';
import {PressProps} from '@react-aria/interactions';

export interface ButtonBase extends DOMProps, PressProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  icon?: ReactElement,
  children?: ReactNode,
  href?: string,
  onKeyDown?: (e) => void
}

export interface ActionButtonProps extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  isEmphasized?: boolean,
  holdAffordance?: boolean
}

export type ButtonGroupButton = ReactElement<ActionButtonProps>;

export interface ButtonGroupProps extends DOMProps, MultipleSelection {
  orientation?: 'horizontal' | 'vertical',
  children: ButtonGroupButton | ButtonGroupButton[],
  isDisabled?: boolean
}
