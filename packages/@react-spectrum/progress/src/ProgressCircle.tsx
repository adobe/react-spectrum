import {clamp} from '@react-aria/utils';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import progressStyles from './index.css';
import React, {CSSProperties, RefObject} from 'react';
import {SpectrumProgressCircleProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/circleloader/vars.css';
import {useProgressBar} from '@react-aria/progress';

export const ProgressCircle = React.forwardRef((props: SpectrumProgressCircleProps, ref: RefObject<HTMLElement>) => {
  let {
    value = 0,
    size = 'M',
    variant,
    isCentered = false,
    isIndeterminate = true,
    className,
    ...otherProps
  } = props;

  let min = 0;
  let max = 100;

  value = clamp(value, min, max);
  let {progressBarProps} = useProgressBar({...props, value, min, max, isIndeterminate});

  let subMask1Style: CSSProperties = {};
  let subMask2Style: CSSProperties = {};
  if (!isIndeterminate) {
    let angle;
    if (value > 0 && value <= 50) {
      angle = -180 + (value / 50 * 180);
      subMask1Style.transform = `rotate(${angle}deg)`;
      subMask2Style.transform = 'rotate(-180deg)';
    } else if (value > 50) {
      angle = -180 + (value - 50) / 50 * 180;
      subMask1Style.transform = 'rotate(0deg)';
      subMask2Style.transform = `rotate(${angle}deg)`;
    }
  }

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...progressBarProps}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-CircleLoader',
          {
            'spectrum-CircleLoader--indeterminate': isIndeterminate,
            'spectrum-CircleLoader--small': size === 'S',
            'spectrum-CircleLoader--large': size === 'L',
            'spectrum-CircleLoader--overBackground': variant === 'overBackground'
          },
          classNames(
            progressStyles,
            {
              'react-spectrum-ProgressCircle--centered': isCentered
            }
          ),
          className
        )
      } >
      <div className={classNames(styles, 'spectrum-CircleLoader-track')} />
      <div className={classNames(styles, 'spectrum-CircleLoader-fills')} >
        <div className={classNames(styles, 'spectrum-CircleLoader-fillMask1')} >
          <div
            className={classNames(styles, 'spectrum-CircleLoader-fillSubMask1')}
            data-testid="fillSubMask1" 
            style={subMask1Style}>
            <div className={classNames(styles, 'spectrum-CircleLoader-fill')} />
          </div>
        </div>
        <div className={classNames(styles, 'spectrum-CircleLoader-fillMask2')} >
          <div
            className={classNames(styles, 'spectrum-CircleLoader-fillSubMask2')}
            data-testid="fillSubMask2"
            style={subMask2Style} >
            <div className={classNames(styles, 'spectrum-CircleLoader-fill')} />
          </div>
        </div>
      </div>
    </div>
  );
});
