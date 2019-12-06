import {clamp} from '@react-aria/utils';
import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import {ProgressBarProps} from '@react-types/progress';
import React, {CSSProperties, HTMLAttributes} from 'react';
import {SpectrumProgressBarBaseProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useNumberFormatter} from '@react-aria/i18n';
import {useStyleProps} from '@react-spectrum/view';

const DEFAULT_FORMAT_OPTION = 'percent';

interface ProgressBarBaseProps extends SpectrumProgressBarBaseProps, ProgressBarProps {
  barClassName?: string,
  barProps?: HTMLAttributes<HTMLDivElement>,
  labelProps?: HTMLAttributes<HTMLDivElement>
}

// This is extracted as a hook so that Meter can reuse it but call a different aria hook with the results.
export function useProgressBarBase<T extends ProgressBarBaseProps>(props: T): T {
  let {
    value = 0,
    min = 0,
    max = 100,
    valueLabel,
    formatOptions = {
      style: DEFAULT_FORMAT_OPTION
    }
  } = props;

  value = clamp(value, min, max);
  let percentage = (value - min) / (max - min);
  let formatter = useNumberFormatter(formatOptions);

  if (!valueLabel) {
    let valueToFormat = formatOptions.style === DEFAULT_FORMAT_OPTION ? percentage : value;
    valueLabel = formatter.format(valueToFormat);
  }

  return {
    ...props,
    value,
    valueLabel
  };
}

// Base ProgressBar component shared with Meter.
function ProgressBarBase(props: ProgressBarBaseProps, ref: DOMRef<HTMLDivElement>) {
  let {
    value = 0,
    min = 0,
    max = 100,
    size = 'L',
    children,
    barClassName,
    valueLabel,
    showValueLabel = !!valueLabel,
    labelPosition = 'side',
    isIndeterminate = false,
    barProps: progressBarProps,
    labelProps,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  let barStyle: CSSProperties = {};
  if (!isIndeterminate) {
    let percentage = (value - min) / (max - min);
    barStyle.width = `${Math.round(percentage * 100)}%`;
  }

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...progressBarProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-BarLoader',
          {
            'spectrum-BarLoader--small': size === 'S',
            'spectrum-BarLoader--large': size === 'L',
            'spectrum-BarLoader--indeterminate': isIndeterminate,
            'spectrum-BarLoader--sideLabel': labelPosition === 'side'
          },
          barClassName,
          styleProps.className
        )
      }>
      {children &&
        <div
          {...labelProps}
          className={classNames(styles, 'spectrum-BarLoader-label')} >
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
}

let _ProgressBarBase = React.forwardRef(ProgressBarBase);
export {_ProgressBarBase as ProgressBarBase};
