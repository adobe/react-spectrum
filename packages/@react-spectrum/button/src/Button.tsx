import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps, FocusableProps} from '@react-types/shared';
import {FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {PressProps} from '@react-aria/interactions';
import React, {JSXElementConstructor, ReactElement, ReactNode} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

export interface ButtonBase extends DOMProps, StyleProps, PressProps, FocusableProps {
  isDisabled?: boolean,
  elementType?: string | JSXElementConstructor<any>,
  icon?: ReactElement,
  children?: ReactNode,
  href?: string
}

export interface ButtonProps extends ButtonBase {
  variant?: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative',
  isQuiet?: boolean
}

// todo: CSS hasn't caught up yet, map
let VARIANT_MAPPING = {
  negative: 'warning'
};

function Button(props: ButtonProps, ref: FocusableRef) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    children,
    variant = 'secondary',
    isQuiet,
    isDisabled,
    icon,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton({...props, ref: domRef});
  let {styleProps} = useStyleProps(otherProps);

  let buttonVariant = variant;
  if (VARIANT_MAPPING[variant]) {
    buttonVariant = VARIANT_MAPPING[variant];
  }

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <ElementType
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...buttonProps}
        ref={domRef}
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
            styleProps.className
          )
        }>
        {cloneIcon(icon, {size: 'S'})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
}

let _Button = React.forwardRef(Button);
export {_Button as Button};
