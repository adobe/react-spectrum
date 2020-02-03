import {DOMProps, FocusableProps, MultipleSelection, PressEvents, StyleProps} from '@react-types/shared';
import {JSXElementConstructor, ReactElement, ReactNode} from 'react';

export interface ButtonProps extends DOMProps, StyleProps, PressEvents, FocusableProps {
  /** Whether the button is disabled */
  isDisabled?: boolean,
  /** 
   * The HTML element or React element used to render the button, e.g. "div", "a", or `RouterLink`
   * @default "button"
   */
  elementType?: string | JSXElementConstructor<any>,
  /** The content to display in the button */
  children?: ReactNode,
  /** A URL to link to if elementType="a" */
  href?: string,
  /** The target window for the link */
  target?: string
}

export interface SpectrumButtonProps extends ButtonProps {
  /** An icon to display in the button */
  icon?: ReactElement,
  /** The [visual style](https://spectrum.adobe.com/page/button/#Options) of the button. */
  variant: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  /** Whether the button should be displayed with a quiet style */
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
