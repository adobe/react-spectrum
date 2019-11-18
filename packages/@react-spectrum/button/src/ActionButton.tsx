import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusRing} from '@react-aria/focus';
import React, {RefObject, useRef, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useButtonProvider} from './ButtonGroup';
import {useLocale} from '@react-aria/i18n';

export interface ActionButtonProps extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  holdAffordance?: boolean
}

export const ActionButton = React.forwardRef((props: ActionButtonProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
  let {direction} = useLocale();
  let buttonGroupProps = useButtonProvider();

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
  } = {...props, ...buttonGroupProps};

  let {buttonProps, isPressed} = useButton({...props, ref, isDisabled: isDisabled});

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
              'is-disabled': isDisabled,
            },
            className
          )
        }>
        {cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon')})}
        <span className={classNames(styles, 'spectrum-ActionButton-label')}>{children}</span>
        {holdAffordance &&
          <CornerTriangle
            className={
              classNames(
                styles,
                'spectrum-Tool-hold',
                {
                  'is-reversed': direction === 'rtl'
                }
              )
            }
          />
        }
      </ElementType>
    </FocusRing>
  );
});
