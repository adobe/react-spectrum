import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';


export interface ToolButtonProps extends ButtonBase {
  holdAffordance?: boolean,
  isSelected?: boolean
  // TODO: once we have real icons, restrict children to that type
}

export function ToolButton(props: ToolButtonProps) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
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
      {cloneIcon(icon || children, {size: 'S', className: styles['spectrum-Icon']})}
      {holdAffordance &&
        <CornerTriangle className={classNames(styles, 'spectrum-Tool-hold')} />
      }
    </ElementType>
  );
}
