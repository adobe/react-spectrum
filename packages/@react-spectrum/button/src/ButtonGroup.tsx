import {ActionButtonProps} from './';
import {ButtonGroupProps} from '@react-types/button';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {ReactElement, RefObject, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useButtonGroup} from '@react-aria/button';

type ButtonGroupButton = ReactElement<ActionButtonProps>;

interface ButtonGroupContext {
  isDisabled?: boolean,
  isEmphasized?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  className?: string,
  role?: string
}

export interface SpectrumButtonGroupProps extends ButtonGroupProps {
  isEmphasized?: boolean,
  isConnected?: boolean
  isJustified?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  children: ButtonGroupButton | ButtonGroupButton[],
  orientation?: 'horizontal' | 'vertical'
}

const ButtonContext = React.createContext<ButtonGroupContext | {}>({});

export function useButtonProvider(): ButtonGroupContext {
  return useContext(ButtonContext);
}

export const ButtonGroup = React.forwardRef((props: SpectrumButtonGroupProps, ref: RefObject<HTMLDivElement>) => {
  let {
    isEmphasized,
    isConnected, // no quiet option available in this mode
    isJustified,
    isDisabled,
    children,
    orientation = 'horizontal',
    className,
    holdAffordance,
    isQuiet,
    ...otherProps
  } = props;

  let {buttonGroupProps, buttonProps} = useButtonGroup(props);
  let isVertical = orientation === 'vertical';

  let itemClassName;
  if (isVertical) {
    itemClassName = 'spectrum-ButtonGroup-item--vertical';
  } else {
    itemClassName = {
      'spectrum-ButtonGroup-item--connected': isConnected && !isQuiet,
      'spectrum-ButtonGroup-item--justified': isJustified
    };
  }

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
            'spectrum-ButtonGroup--vertical': isVertical
          },
          className
        )
      } >
      <ButtonContext.Provider
        value={{
          ...buttonProps,
          isEmphasized,
          isDisabled,
          isQuiet,
          holdAffordance,
          className: classNames(buttonStyles, itemClassName)
        }}>
        {children}
      </ButtonContext.Provider>
    </div>
  );
});
