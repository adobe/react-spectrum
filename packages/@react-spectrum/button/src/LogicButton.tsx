import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

export interface LogicButtonProps extends ButtonBase {
  variant?: 'and' | 'or'
}

export function LogicButton(props: LogicButtonProps) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    variant,
    children,
    isDisabled,
    icon,
    className,
    ...otherProps
  } = props;
  let {buttonProps} = useButton(props);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
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
    </FocusRing>
  );
}
