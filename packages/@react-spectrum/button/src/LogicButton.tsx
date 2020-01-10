import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SpectrumLogicButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

function LogicButton(props: SpectrumLogicButtonProps, ref: FocusableRef) {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    variant,
    children,
    isDisabled,
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
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
}

let _LogicButton = React.forwardRef(LogicButton);
export {_LogicButton as LogicButton};
