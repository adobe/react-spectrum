import {ButtonBase} from '@react-types/button';
import {classNames, cloneIcon, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useStyleProps} from '@react-spectrum/view';

interface FieldButtonProps extends ButtonBase {
  isQuiet?: boolean,
  validationState?: 'valid' | 'invalid'
}

// @private
function FieldButton(props: FieldButtonProps, ref: FocusableRef) {
  let {
    elementType: ElementType = 'button',
    isQuiet,
    isDisabled,
    validationState,
    icon,
    children,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton({...props, ref: domRef});
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <ElementType
        {...mergeProps(filterDOMProps(otherProps), buttonProps)}
        ref={domRef}
        className={
          classNames(
            styles,
            'spectrum-FieldButton',
            {
              'spectrum-FieldButton--quiet': isQuiet,
              'is-active': isPressed,
              'is-disabled': isDisabled,
              'is-invalid': validationState === 'invalid'
            },
            styleProps.className
          )
        }>
        {cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon')})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
}

let _FieldButton = React.forwardRef(FieldButton);
export {_FieldButton as FieldButton};
