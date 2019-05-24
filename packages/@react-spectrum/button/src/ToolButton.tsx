import {ButtonBase} from './Button';
import {classNames} from '@react-spectrum/utils/src/classNames';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
// @ts-ignore
import CornerTriangle from '../../../../src/Icon/core/CornerTriangle';
import filterDOMProps from "@react-spectrum/utils/src/filterDOMProps";
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';


export interface ToolButtonProps extends ButtonBase {
  holdAffordance?: boolean,
  isSelected?: boolean
  // TODO: once we have real icons, restrict children to that type
}

export function ToolButton(props: ToolButtonProps) {
  let {
    elementType:ElementType = 'button',
    children,
    isSelected,
    isDisabled,
    holdAffordance,
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
          'spectrum-Tool',
          {
            'is-selected': isSelected,
            'is-disabled': isDisabled
          },
          className
        )
      }>
      {cloneIcon(icon || children, {size: 'S'})}
      {holdAffordance &&
      <CornerTriangle role="presentation" size={null} className={classNames(styles, 'spectrum-Tool-hold')} />
      }
    </ElementType>
  );
}
