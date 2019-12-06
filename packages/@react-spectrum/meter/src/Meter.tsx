import {classNames, DOMRef} from '@react-spectrum/utils';
import {ProgressBarBase, SpectrumProgressBarBaseProps, useProgressBarBase} from '@react-spectrum/progress';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useMeter} from '@react-aria/meter';

export interface SpectrumMeterProps extends SpectrumProgressBarBaseProps {
  variant?: 'positive' | 'warning' | 'critical'
}

function Meter(props: SpectrumMeterProps, ref: DOMRef<HTMLDivElement>) {
  let {variant = 'positive', ...otherProps} = useProgressBarBase(props);
  const {
    meterProps,
    labelProps
  } = useMeter({...otherProps, textValue: otherProps.valueLabel as any});

  return (
    <ProgressBarBase
      {...otherProps}
      ref={ref}
      barProps={meterProps}
      labelProps={labelProps}
      barClassName={
        classNames(
          styles,
          {
            'is-positive': variant === 'positive',
            'is-warning': variant === 'warning',
            'is-critical': variant === 'critical'
          }
        )
      } />
  );
}

let _Meter = React.forwardRef(Meter);
export {_Meter as Meter};
