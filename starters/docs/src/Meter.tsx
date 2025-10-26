'use client';
import {
  Meter as AriaMeter,
  MeterProps as AriaMeterProps
} from 'react-aria-components';
import {Label} from './Form';
import './Meter.css';

export interface MeterProps extends AriaMeterProps {
  label?: string;
}

export function Meter({ label, ...props }: MeterProps) {
  return (
    (
      <AriaMeter {...props}>
        {({ percentage, valueText }) => (
          <>
            <Label>{label}</Label>
            <span className="value">{valueText}</span>
            <div className="track inset">
              <div
                className="fill"
                style={{
                  width: percentage + '%',
                  '--fill-color': percentage < 70 ? 'var(--green)' : percentage < 90 ? 'var(--orange)' : 'var(--red)'
                } as any} />
            </div>
          </>
        )}
      </AriaMeter>
    )
  );
}
