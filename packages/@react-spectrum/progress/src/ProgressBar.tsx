import {classNames, DOMRef} from '@react-spectrum/utils';
import {ProgressBarBase, useProgressBarBase} from './ProgressBarBase';
import React from 'react';
import {SpectrumProgressBarProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useProgressBar} from '@react-aria/progress';

function ProgressBar(props: SpectrumProgressBarProps, ref: DOMRef<HTMLDivElement>) {
  let {variant, ...otherProps} = useProgressBarBase(props);
  const {
    progressBarProps,
    labelProps
  } = useProgressBar({...otherProps, textValue: otherProps.valueLabel as any});

  return (
    <ProgressBarBase
      {...otherProps}
      ref={ref}
      barProps={progressBarProps}
      labelProps={labelProps}
      barClassName={
        classNames(
          styles,
          {
            'spectrum-BarLoader--overBackground': variant === 'overBackground'
          }
        )
      } />
  );
}

let _ProgressBar = React.forwardRef(ProgressBar);
export {_ProgressBar as ProgressBar};
