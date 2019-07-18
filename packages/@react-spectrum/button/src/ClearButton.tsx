import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
// @ts-ignore
import CrossSmall from '../../../../Icon/core/CrossSmall'; // Alternative is Close from '@react/react-spectrum/Icon/Close';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';

export function ClearButton(props) {
  let {
    className,
    ...otherProps
  } = props;
  let {buttonProps} = useButton(props);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <button
        {...filterDOMProps(otherProps, {icon: false})}
        {...buttonProps}
        className={
          classNames(
            styles,
            'spectrum-ClearButton',
            className
          )
        }>
        {cloneIcon(<CrossSmall />, {size: 'S'})}
      </button>
    </FocusRing>
  );
}
