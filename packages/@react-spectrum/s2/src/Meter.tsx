import {
  Label,
  Meter as AriaMeter,
  MeterProps as AriaMeterProps
} from 'react-aria-components';
import {ReactNode} from 'react';

export interface MeterProps extends AriaMeterProps {
  label?: ReactNode
}

export function Meter({label, ...props}: MeterProps) {
  return (
    <AriaMeter {...props}>
      {({percentage, valueText}) => (
        <>
          <Label>{label}</Label>
          <span className="value">{valueText}</span>
          <div className="bar">
            <div className="fill" style={{width: percentage + '%'}} />
          </div>
        </>
      )}
    </AriaMeter>
  );
}
