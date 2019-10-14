import {clamp} from '@react-aria/utils';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {CSSProperties, RefObject} from 'react';
import {SpectrumProgressBarProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useNumberFormatter} from '@react-aria/i18n';
import {useProgressBar} from '@react-aria/progress';

const DEFAULT_FORMAT_OPTION = 'percent';

export const ProgressBar = React.forwardRef((props: SpectrumProgressBarProps, ref: RefObject<HTMLElement>) => {
  let {
    value = 0,
    min = 0,
    max = 100,
    size = 'L',
    children,
    variant,
    valueLabel,
    showValueLabel = !!valueLabel,
    labelPosition = 'side',
    isIndeterminate = false,
    formatOptions = {
      style: DEFAULT_FORMAT_OPTION
    },
    className,
    ...otherProps
  } = props;

  value = clamp(value, min, max);
  let percentage = value / (max - min);
  let formatter = useNumberFormatter(formatOptions);

  if (showValueLabel && !valueLabel) {
    let valueToFormat = formatOptions.style === DEFAULT_FORMAT_OPTION ? percentage : value;
    valueLabel = formatter.format(valueToFormat);
  }

  const {
    progressBarProps,
    labelAriaProps
  } = useProgressBar({...props, value, min, max, isIndeterminate, 'aria-valuetext': valueLabel});

  let barStyle: CSSProperties = {};
  if (!isIndeterminate) {
    barStyle.width = `${Math.round(percentage * 100)}%`;
  }

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...progressBarProps}
      ref={ref}
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
      } >
      {children &&
        <div
          className={classNames(styles, 'spectrum-BarLoader-label')}
          {...labelAriaProps} >
            {children}
        </div>
      }
      {showValueLabel &&
        <div className={classNames(styles, 'spectrum-BarLoader-percentage')} >
          {valueLabel}
        </div>
      }
      <div className={classNames(styles, 'spectrum-BarLoader-track')} >
        <div
          className={classNames(styles, 'spectrum-BarLoader-fill')}
          style={barStyle} />
      </div>
    </div>
  );
});
