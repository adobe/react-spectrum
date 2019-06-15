import {ButtonBase} from './Button';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';


export interface LogicButtonProps extends ButtonBase {
  variant?: 'and' | 'or'
}

export function LogicButton(props: LogicButtonProps) {
  let {
    elementType:ElementType = 'button',
    variant,
    children,
    isDisabled,
    icon,
    className,
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
          'spectrum-LogicButton',
          {
            [`spectrum-LogicButton--${variant}`]: variant,
            'is-disabled': isDisabled
          },
          className
        )
      }>
      {cloneIcon(icon, {size: 'S'})}
      <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
    </ElementType>
  );
}
