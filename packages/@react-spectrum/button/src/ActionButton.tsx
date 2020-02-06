import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {cloneElement} from 'react';
import {SpectrumActionButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useProviderProps} from '@react-spectrum/provider';

function ActionButton(props: SpectrumActionButtonProps, ref: FocusableRef) {
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
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {
    UNSAFE_className: groupClassName,
    ...otherButtonProps
  } = buttonProps;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <ElementType
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...otherButtonProps}
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
            styleProps.className,
            groupClassName
          )
        }>
        {icon && cloneElement(
          icon, 
          {
            size: 'S',
            UNSAFE_className: classNames(
              styles,
              'spectrum-Icon', 
              icon.props.UNSAFE_className
            )
          }
        )}
        <span className={classNames(styles, 'spectrum-ActionButton-label')}>{children}</span>
        {holdAffordance &&
          <CornerTriangle UNSAFE_className={classNames(styles, 'spectrum-ActionButton-hold')} />
        }
      </ElementType>
    </FocusRing>
  );
}

let _ActionButton = React.forwardRef(ActionButton);
export {_ActionButton as ActionButton};
