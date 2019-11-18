import {ActionButton} from './';
import {ButtonGroupBase} from '@react-types/button';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {PressProps} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {ReactElement, RefObject, useRef, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useButtonGroup} from '@react-aria/button';
import {MultipleSelectionBase} from '@react-types/shared';

type ButtonGroupButton = ReactElement<ActionButton>;

interface ButtonGroupContextBase {
  isDisabled?: boolean,
  isQuiet?: boolean,
  isEmphasized?: boolean,
  holdAffordance?: boolean,
}

interface ButtonGroupContext extends ButtonGroupContextBase {
  className?: string,
  role?: 'checkbox' | 'radio'
}

export interface SpectrumButtonGroupProps extends ButtonGroupBase, ButtonGroupContextBase, MultipleSelectionBase {
  children: ButtonGroupButton | ButtonGroupButton[],
  orientation?: 'horizontal' | 'vertical'
}

const ButtonContext = React.createContext<ButtonGroupContext | null>(null);

export function useButtonProvider(): ButtonGroupContext {
  return useContext(ButtonContext);
}

export const ButtonGroup = React.forwardRef((props: ButtonGroupProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
  let {
    isEmphasized,
    isConnected,
    isJustified, // no quiet option available in this mode  
    isDisabled,
    children,
    orientation = 'horizontal',
    className,
    holdAffordance,
    isQuiet,
    ...otherProps
  } = props;

  let {buttonGroupProps, buttonProps} = useButtonGroup(props);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...buttonGroupProps}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-ButtonGroup',
          {
            'spectrum-ButtonGroup--vertical': orientation === 'vertical',
            'spectrum-ButtonGroup--connected': isConnected,
            'spectrum-ButtonGroup--justified': isJustified && !isQuiet
          },
          className
        )
      }
       >
      <ButtonContext.Provider
          value={{
            ...buttonProps,
            isEmphasized,
            isDisabled,
            isQuiet: isQuiet && !isConnected,
            holdAffordance,
            className: `spectrum-ButtonGroup-item--${orientation}`,
          }}>
        {children}
      </ButtonContext.Provider>
    </div>
  );
});
