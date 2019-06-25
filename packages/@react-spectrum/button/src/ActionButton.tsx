import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

export interface ActionButtonProps extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  holdAffordance?: boolean
}

export function ActionButton(props: ActionButtonProps) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    isQuiet,
    isSelected,
    isDisabled,
    icon,
    className,
    children,
    holdAffordance,
    ...otherProps
  } = props;
  let {buttonProps} = useButton(props);

  return (
    <ElementType
      {...filterDOMProps(otherProps)}
      {...buttonProps}
      className={
        classNames(
          styles,
          'spectrum-ActionButton',
          {
            'spectrum-ActionButton--quiet': isQuiet,
            'is-selected': isSelected,
            'is-disabled': isDisabled
          },
          className
        )
      }>
      {cloneIcon(icon, {size: 'S'})}
      <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      {holdAffordance &&
        // @ts-ignore
        <svg role="presentation" size={null} className={classNames(styles, 'spectrum-Tool-hold')} xmlns="http://www.w3.org/2000/svg" width="5" height="5"><path d="M4.74.01a.25.25 0 0 0-.177.073l-4.48 4.48a.25.25 0 0 0 .177.427h4.48a.25.25 0 0 0 .25-.25V.26a.25.25 0 0 0-.25-.25z" /></svg>
      }
    </ElementType>
  );
}
