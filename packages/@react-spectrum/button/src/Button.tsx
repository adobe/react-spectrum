import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import {PressProps} from '@react-aria/interactions';
import React, {JSXElementConstructor, ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

export interface ButtonBase extends React.AllHTMLAttributes<HTMLElement>, PressProps {
  isDisabled?: boolean,
  isSelected?: boolean,
  elementType?: string | JSXElementConstructor<any>,
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

export const Button = React.forwardRef((props: ButtonProps, ref) => {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
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
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <ElementType
        {...filterDOMProps(otherProps)}
        {...buttonProps}
        ref={ref}
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
    </FocusRing>
  );
});
