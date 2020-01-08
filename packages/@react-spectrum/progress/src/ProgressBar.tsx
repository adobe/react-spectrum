import {classNames} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {ProgressBarBase} from './ProgressBarBase';
import React from 'react';
import {SpectrumProgressBarProps} from '@react-types/progress';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useProgressBar} from '@react-aria/progress';

function ProgressBar(props: SpectrumProgressBarProps, ref: DOMRef<HTMLDivElement>) {
  let {variant, ...otherProps} = props;
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
