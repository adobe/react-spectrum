import {ButtonBase} from './Button';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useButtonProvider} from './ButtonGroup';
import {useLocale} from '@react-aria/i18n';

export interface ActionButtonProps extends ButtonBase {
  isQuiet?: boolean,
  isSelected?: boolean,
  isEmphasized?: boolean,
  holdAffordance?: boolean
}

export const ActionButton = React.forwardRef((props: ActionButtonProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
  let {direction} = useLocale();

  let buttonGroupProps = useButtonProvider();
  let mergedProps = mergeProps(props, buttonGroupProps);

  let {
    elementType: ElementType = 'button',
    isQuiet,
    isSelected,
    isDisabled,
    isEmphasized,
    icon,
    className,
    children,
    holdAffordance,
    ...otherProps
  } = mergedProps;

  let {buttonProps, isPressed} = useButton({...mergedProps, ref});

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
              'spectrum-ActionButton--emphasized': isEmphasized,
              'is-active': isPressed,
              'is-selected': isSelected,
              'is-disabled': isDisabled
            },
            className
          )
        }>
        {icon && cloneIcon(icon, {size: 'S', className: classNames(styles, 'spectrum-Icon', icon.props.className)})}
        <span className={classNames(styles, 'spectrum-ActionButton-label')}>{children}</span>
        {holdAffordance &&
          <CornerTriangle
            className={
              classNames(
                styles,
                'spectrum-ActionButton-hold',
                {
                  'is-reversed': direction === 'rtl'
                }
              )
            } />
        }
      </ElementType>
    </FocusRing>
  );
});
