import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
import {HTMLElement} from 'react-dom';
import React, {JSXElementConstructor, ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';

export interface ButtonBase extends React.AllHTMLAttributes<HTMLElement> {
  isDisabled?: boolean,
  isSelected?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  onPress?: (event: Event) => void,
  icon?: ReactNode,
  children?: ReactNode
}

export interface ButtonProps extends ButtonBase {
  variant?: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  isQuiet?: boolean
}

// todo: CSS hasn't caught up yet, map
let VARIANT_MAPPING = {
  negative: 'warning'
};

// todo: add back in focus ring later
export function Button(props: ButtonProps) {
  let {
    elementType:ElementType = 'button',
    children,
    variant = 'secondary',
    isQuiet,
    isDisabled,
    icon,
    className,
    ...otherProps
  } = props;
  let {buttonProps} = useButton(props);

  let buttonVariant = variant;
  if (VARIANT_MAPPING[variant]) {
    buttonVariant = VARIANT_MAPPING[variant];
  }
  return (
    <ElementType
      {...filterDOMProps(otherProps)}
      {...buttonProps}
      className={
        classNames(
          styles,
          'spectrum-Button',
          `spectrum-Button--${buttonVariant}`,
          {
            'spectrum-Button--quiet': isQuiet,
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
