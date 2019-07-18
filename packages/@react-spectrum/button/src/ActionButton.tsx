import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
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
      {cloneIcon(icon, {size: 'S', className: styles['spectrum-Icon']})}
      <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      {holdAffordance &&
        <CornerTriangle className={classNames(styles, 'spectrum-Tool-hold')} />
      }
    </ElementType>
  );
}
