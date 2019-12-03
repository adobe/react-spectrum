import {ButtonBase} from '@react-types/button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

export interface LogicButtonProps extends ButtonBase {
  variant?: 'and' | 'or'
}

export const LogicButton = React.forwardRef((props: LogicButtonProps, ref: RefObject<HTMLElement>) => {
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    variant,
    children,
    isDisabled,
    icon,
    className,
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
            'spectrum-LogicButton',
            {
              [`spectrum-LogicButton--${variant}`]: variant,
              'is-disabled': isDisabled,
              'is-active': isPressed
            },
            className
          )
        }>
        {icon && cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon', icon.props.className)})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </ElementType>
    </FocusRing>
  );
});
