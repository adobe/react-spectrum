import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLElement} from 'react-dom';
import React, {CSSProperties, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/circleloader/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

export interface ProgressCircleProps extends DOMProps {
  value?: number,
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean,
  isIndeterminate?: boolean
}

export const ProgressCircle = React.forwardRef((props: ProgressCircleProps, ref: RefObject<HTMLElement>) => {
  let defaults = {
    value: 0,
    size: 'M',
    isCentered: false,
    isIndeterminate: true
  };
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  let {
    value,
    size,
    variant,
    isCentered,
    isIndeterminate,
    className,
    ...otherProps
  } = completeProps;

  let angle;
  let fillSubmask1Style: CSSProperties = {};
  let fillSubmask2Style: CSSProperties = {};
  let ariaValue = undefined;

  if (!isIndeterminate) {
    value = Math.min(Math.max(+value, 0), 100);
    ariaValue = value;
    if (value > 0 && value <= 50) {
      angle = -180 + (value / 50 * 180);
      fillSubmask1Style.transform = 'rotate(' + angle + 'deg)';
      fillSubmask2Style.transform = 'rotate(-180deg)';
    } else if (value > 50) {
      angle = -180 + (value - 50) / 50 * 180;
      fillSubmask1Style.transform = 'rotate(0deg)';
      fillSubmask2Style.transform = 'rotate(' + angle + 'deg)';
    }
  }

  return (
    <div
      className={
        classNames(
          styles,
          'spectrum-CircleLoader',
          {
            'spectrum-CircleLoader--indeterminate': isIndeterminate,
            'spectrum-CircleLoader--small': size === 'S',
            'spectrum-CircleLoader--large': size === 'L',
            'spectrum-CircleLoader--overBackground': variant === 'overBackground',
            'react-spectrum-Wait--centered': isCentered
          },
          className
        )
      }
      ref={ref}
      role="progressbar"
      aria-valuenow={ariaValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...filterDOMProps(otherProps)} >
      <div className={classNames(styles, 'spectrum-CircleLoader-track')} />
      <div className={classNames(styles, 'spectrum-CircleLoader-fills')} >
        <div className={classNames(styles, 'spectrum-CircleLoader-fillMask1')} >
          <div className={classNames(styles, 'spectrum-CircleLoader-fillSubMask1')} style={fillSubmask1Style}>
            <div className={classNames(styles, 'spectrum-CircleLoader-fill')} />
          </div>
        </div>
        <div className={classNames(styles, 'spectrum-CircleLoader-fillMask2')} >
          <div className={classNames(styles, 'spectrum-CircleLoader-fillSubMask2')} style={fillSubmask2Style}>
            <div className={classNames(styles, 'spectrum-CircleLoader-fill')} />
          </div>
        </div>
      </div>
    </div>
  );
});
