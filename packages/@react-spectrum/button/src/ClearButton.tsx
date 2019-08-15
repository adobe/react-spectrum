import {ButtonBase} from './Button';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
// @ts-ignore
import CrossSmall from '../../../../Icon/core/CrossSmall'; // Alternative is Close from '@react/react-spectrum/Icon/Close';
import {FocusRing} from '@react-aria/focus';
import React, {RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';

interface ClearButtonProps extends ButtonBase {}

export const ClearButton = React.forwardRef((props: ClearButtonProps, ref: RefObject<HTMLButtonElement>) => {
  let {
    className,
    ...otherProps
  } = props;
  ref = ref || useRef();
  let {buttonProps, isPressed} = useButton({...props, ref});

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <button
        {...filterDOMProps(otherProps, {icon: false})}
        {...buttonProps}
        ref={ref}
        className={
          classNames(
            styles,
            'spectrum-ClearButton',
            {
              'is-active': isPressed
            },
            className
          )
        }>
        {cloneIcon(<CrossSmall />, {size: 'S'})}
      </button>
    </FocusRing>
  );
});
