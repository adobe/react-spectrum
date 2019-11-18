import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';

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
    className,
    children,
    ...otherProps
  } = props;
  ref = ref || useRef();
  let {buttonProps, isPressed} = useButton({...props, ref});

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <ElementType
        {...filterDOMProps(otherProps)}
        {...buttonProps}
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
            className
          )
        }>
        {cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon')})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
});
