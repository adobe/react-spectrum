import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import {ProgressCircleProps} from '@react-types/progress';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/circleloader/vars.css';
import {useProgressCircle} from '@react-aria/progress';

export const ProgressCircle = React.forwardRef((props: ProgressCircleProps, ref: RefObject<HTMLElement>) => {
  let {
    value,
    size = 'M',
    variant,
    isCentered = false,
    isIndeterminate = true,
    className,
    ...otherProps
  } = props;

  let {ariaProps, subMask1Style, subMask2Style} = useProgressCircle({value, isIndeterminate});

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
      {...ariaProps}
      {...filterDOMProps(otherProps)}>
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
