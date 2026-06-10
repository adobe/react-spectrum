'use client';
import {useMeter, type AriaMeterProps} from 'react-aria/useMeter';
import './Meter.css';
import './Form.css';

export function Meter(props: AriaMeterProps) {
  let {label, value = 0, minValue = 0, maxValue = 100} = props;
  // useMeter provides the ARIA attributes and an accessible value label.
  let {meterProps, labelProps} = useMeter(props);

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
            } as any
          }
        />
      </div>
    </div>
  );
}
