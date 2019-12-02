import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useStyleProps} from '@react-spectrum/view';

interface FieldButtonProps extends ButtonBase {
  isQuiet?: boolean,
  validationState?: 'valid' | 'invalid'
}

// @private
export const FieldButton = React.forwardRef((props: FieldButtonProps, ref: RefObject<HTMLElement>) => {
  let {
    elementType: ElementType = 'button',
    isQuiet,
    isDisabled,
    validationState,
    icon,
    children,
    ...otherProps
  } = props;
  ref = ref || useRef();
  let {buttonProps, isPressed} = useButton({...props, ref});
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <ElementType
        {...mergeProps(filterDOMProps(otherProps), buttonProps)}
        ref={ref}
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
        {cloneIcon(icon, {size: 'S'})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
});
