import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import {mergeProps} from '@react-aria/utils';
import {PressProps} from '@react-aria/interactions';
import React, {JSXElementConstructor, ReactNode, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

export interface ButtonBase extends DOMProps, PressProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  icon?: ReactNode,
  children?: ReactNode,
  href?: string,
  onKeyDown?: (e) => void
}

export interface ButtonProps extends ButtonBase {
  variant?: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  isQuiet?: boolean
}

// todo: CSS hasn't caught up yet, map
let VARIANT_MAPPING = {
  negative: 'warning'
};

export const Button = React.forwardRef((props: ButtonProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
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
  let {buttonProps, isPressed} = useButton({...props, ref});

  let buttonVariant = variant;
  if (VARIANT_MAPPING[variant]) {
    buttonVariant = VARIANT_MAPPING[variant];
  }
  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <ElementType
        {...mergeProps(filterDOMProps(otherProps), buttonProps)}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-Button',
            `spectrum-Button--${buttonVariant}`,
            {
              'spectrum-Button--quiet': isQuiet,
              'is-disabled': isDisabled,
              'is-active': isPressed
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
