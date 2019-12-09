import {ActionButtonProps} from '@react-types/button';
import {classNames, cloneIcon, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/view';

function ActionButton(props: ActionButtonProps, ref: FocusableRef) {
  let {direction} = useLocale();

  props = useProviderProps(props);
  let {
    elementType: ElementType = 'button',
    isQuiet,
    isSelected,
    isDisabled,
    isEmphasized,
    icon,
    children,
    holdAffordance,
    autoFocus,
    ...otherProps
  } = props;

  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton({...props, ref: domRef});
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}  autoFocus={autoFocus}>
      <ElementType
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...buttonProps}
        ref={domRef}
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
            styleProps.className
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
}

let _ActionButton = React.forwardRef(ActionButton);
export {_ActionButton as ActionButton};
