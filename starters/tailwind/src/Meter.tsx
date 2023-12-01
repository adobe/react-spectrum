import {
  Meter as AriaMeter,
  MeterProps as AriaMeterProps,
  MeterRenderProps
} from 'react-aria-components';
import { Label } from './Field';
import { AlertTriangle } from 'lucide-react';

export interface MeterProps extends AriaMeterProps {
  label?: string;
}

export function Meter({ label, ...props }: MeterProps) {
  return (
    <AriaMeter {...props} className="flex flex-col gap-1">
      {({ percentage, valueText }) => (
        <>
          <div className="flex justify-between gap-2">
            <Label>{label}</Label>
            <span className={`text-sm ${percentage >= 80 ? 'text-red-600' : 'text-gray-600'}`}>
              {percentage >= 80 && <AlertTriangle className="inline-block w-4 h-4 align-text-bottom" />}
              {' ' + valueText}
            </span>
          </div>
          <div className="w-64 h-2 rounded-full bg-gray-300 relative">
            <div className={`absolute top-0 left-0 h-full rounded-full ${getColor(percentage)}`} style={{ width: percentage + '%' }} />
          </div>
        </>
      )}
    </AriaMeter>
  );
}

function getColor(percentage: number) {
  if (percentage < 70) {
    return 'bg-green-600';
  }

  if (percentage < 80) {
    return 'bg-orange-500';
  }

  return 'bg-red-600';
}
