import {ButtonBase} from '@react-types/button';
import {classNames, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import CrossSmall from '@spectrum-icons/ui/CrossSmall';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useStyleProps} from '@react-spectrum/view';

interface ClearButtonProps extends ButtonBase {
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
  let {buttonProps, isPressed} = useButton({...props, ref: domRef});
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
