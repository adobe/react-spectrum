import {ButtonProps} from '@react-types/button';
import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import CrossSmall from '@spectrum-icons/ui/CrossSmall';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';

interface ClearButtonProps extends ButtonProps {
  focusClassName?: string,
  variant?: 'overBackground'
}

function ClearButton(props: ClearButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let {
    children = <CrossSmall />,
    focusClassName,
    variant,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring', focusClassName)} autoFocus={autoFocus}>
      <button
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...buttonProps}
        ref={domRef}
        className={
          classNames(
            styles,
            'spectrum-ClearButton',
            {
              [`spectrum-ClearButton--${variant}`]: variant,
              'is-active': isPressed
            },
            styleProps.className
          )
        }>
        {children}
      </button>
    </FocusRing>
  );
}

let _ClearButton = React.forwardRef(ClearButton);
export {_ClearButton as ClearButton};
