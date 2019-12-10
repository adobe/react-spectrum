import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/view';

export interface LogicButtonProps extends ButtonBase {
  variant?: 'and' | 'or'
}

function LogicButton(props: LogicButtonProps, ref: FocusableRef) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    variant,
    children,
    isDisabled,
    icon,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {styleProps} = useStyleProps(otherProps);

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
            'spectrum-LogicButton',
            {
              [`spectrum-LogicButton--${variant}`]: variant,
              'is-disabled': isDisabled,
              'is-active': isPressed
            },
            styleProps.className
          )
        }>
        {icon && cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon', icon.props.className)})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
}

let _LogicButton = React.forwardRef(LogicButton);
export {_LogicButton as LogicButton};
