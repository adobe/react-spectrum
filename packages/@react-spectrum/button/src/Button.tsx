import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {cloneElement} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

// todo: CSS hasn't caught up yet, map
let VARIANT_MAPPING = {
  negative: 'warning'
};

function Button(props: SpectrumButtonProps, ref: FocusableRef) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    children,
    variant,
    isQuiet,
    isDisabled,
    icon,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
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
        {icon && cloneElement(
          icon, 
          {
            size: 'S',
            UNSAFE_className: classNames(
              styles,
              'spectrum-Icon',
              icon.props && icon.props.UNSAFE_className
            )
          }
        )}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
}

/** 
 * Buttons allow users to perform an action or to navigate to another page. 
 * They have multiple styles for various needs, and are ideal for calling attention to 
 * where a user needs to do something in order to move forward in a flow.
 */
let _Button = React.forwardRef(Button);
export {_Button as Button};
