import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import {ProgressBarProps} from '@react-types/progress';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useProgressBar} from '@react-aria/progress';

export const ProgressBar = React.forwardRef((props: ProgressBarProps, ref: RefObject<HTMLElement>) => {
  let {
    size = 'L',
    children,
    valueLabel,
    showValueLabel = !!valueLabel, // Whether the label should be shown or not
    variant,
    labelPosition = 'side',
    isIndeterminate = false,
    className,
    ...otherProps
  } = props;

  const {
    progressBarProps,
    labelAriaProps,
    labelProps,
    barProps
  } = useProgressBar(props);

  let width;
  if (!isIndeterminate) {
    width = `${barProps.percentage}%`;
  }

  return (
    <div
      className={
        classNames(
          styles,
          'spectrum-BarLoader',
          {
            'spectrum-BarLoader--small': size === 'S',
            'spectrum-BarLoader--large': size === 'L',
            'spectrum-BarLoader--indeterminate': isIndeterminate,
            'spectrum-BarLoader--sideLabel': labelPosition === 'side',
            'spectrum-BarLoader--overBackground': variant === 'overBackground',
            'is-positive': variant === 'positive',
            'is-warning': variant === 'warning',
            'is-critical': variant === 'critical'
          },
          className
        )
      }
      ref={ref}
      {...filterDOMProps(otherProps)}
      {...progressBarProps} >
      {children &&
        <div
          className={classNames(styles, 'spectrum-BarLoader-label')}
          {...labelAriaProps} >
            {children}
        </div>
      }
      {showValueLabel &&
        <div className={classNames(styles, 'spectrum-BarLoader-percentage')} >
          {valueLabel || labelProps.formattedValueLabel}
        </div>
      }
      <div className={classNames(styles, 'spectrum-BarLoader-track')} >
        <div
          className={classNames(styles, 'spectrum-BarLoader-fill')}
          style={{width}} />
      </div>
    </div>
  );
});
