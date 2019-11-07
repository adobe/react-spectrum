import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusRing} from '@react-aria/focus';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

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
    className,
    children,
    holdAffordance,
    ...otherProps
  } = props;
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
            'spectrum-ActionButton',
            {
              'spectrum-ActionButton--quiet': isQuiet,
              'is-active': isPressed,
              'is-selected': isSelected,
              'is-disabled': isDisabled
            },
            className
          )
        }>
        {cloneIcon(icon, {size: 'S'})}
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
        {holdAffordance &&
          <CornerTriangle className={classNames(styles, 'spectrum-ActionButton-hold')} />
        }
      </ElementType>
    </FocusRing>
  );
});
