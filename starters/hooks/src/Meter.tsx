'use client';
import {useMeter, type AriaMeterProps} from 'react-aria/useMeter';
import type {CSSProperties} from 'react';
import './Meter.css';
import './Form.css';

export function Meter(props: AriaMeterProps) {
  let {label, value = 0, minValue = 0, maxValue = 100} = props;
  /*- begin highlight -*/
  let {meterProps, labelProps} = useMeter(props);
  /*- end highlight -*/

  // Calculate the width of the meter fill as a percentage.
  let percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div {...meterProps} className="react-aria-Meter">
      <label className="react-aria-Label" {...labelProps}>
        {label}
      </label>
      <span className="value">{meterProps['aria-valuetext']}</span>
      <div className="track inset">
        <div
          className="fill"
          style={
            {
              width: percentage + '%',
              '--fill-color':
                percentage < 70 ? 'var(--green)' : percentage < 90 ? 'var(--orange)' : 'var(--red)'
            } as CSSProperties & {'--fill-color': string}
          }
        />
      </div>
    </div>
  );
}
