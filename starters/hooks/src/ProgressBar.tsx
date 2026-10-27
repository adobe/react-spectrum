'use client';
import {useProgressBar, type AriaProgressBarProps} from 'react-aria/useProgressBar';
import type {CSSProperties} from 'react';
import './ProgressBar.css';
import './Form.css';

export function ProgressBar(props: AriaProgressBarProps) {
  let {label, value = 0, minValue = 0, maxValue = 100, isIndeterminate} = props;
  /*- begin highlight -*/
  let {progressBarProps, labelProps} = useProgressBar(props);
  /*- end highlight -*/

  // Calculate the width of the progress fill as a percentage.
  let percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div {...progressBarProps} className="react-aria-ProgressBar">
      <label className="react-aria-Label" {...labelProps}>
        {label}
      </label>
      <span className="value">{progressBarProps['aria-valuetext']}</span>
      <div className="track inset">
        <div
          className="fill"
          style={
            {'--percent': (isIndeterminate ? 100 : percentage) + '%'} as CSSProperties & {
              '--percent': string;
            }
          }
        />
      </div>
    </div>
  );
}
