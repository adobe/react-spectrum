import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/view';

export interface ActionButtonProps extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  holdAffordance?: boolean
}

export const ActionButton = React.forwardRef((props: ActionButtonProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    isQuiet,
    isSelected,
    isDisabled,
    icon,
    children,
    holdAffordance,
    ...otherProps
  } = props;
  let {buttonProps, isPressed} = useButton({...props, ref});
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <ElementType
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...buttonProps}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-ActionButton',
            {
              'spectrum-ActionButton--quiet': isQuiet,
              'is-active': isPressed,
              'is-selected': isSelected,
              'is-disabled': isDisabled
            },
            styleProps.className
          )
        }>
        {icon && cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon', icon.props.className)})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
        {holdAffordance &&
          <CornerTriangle className={classNames(styles, 'spectrum-ActionButton-hold')} />
        }
      </ElementType>
    </FocusRing>
  );
});
