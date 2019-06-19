import {ButtonBase} from './Button';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
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
      {cloneIcon(icon || children, {size: 'S'})}
      {holdAffordance &&
        // @ts-ignore
        <svg role="presentation" size={null} className={classNames(styles, 'spectrum-Tool-hold')} xmlns="http://www.w3.org/2000/svg" width="5" height="5"><path d="M4.74.01a.25.25 0 0 0-.177.073l-4.48 4.48a.25.25 0 0 0 .177.427h4.48a.25.25 0 0 0 .25-.25V.26a.25.25 0 0 0-.25-.25z" /></svg>
      }
    </ElementType>
  );
}
