import {classNames, cloneIcon, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
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
    icon,
    children,
    holdAffordance,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
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
}

let _ActionButton = React.forwardRef(ActionButton);
export {_ActionButton as ActionButton};
