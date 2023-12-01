import {
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps
} from 'react-aria-components';
import { Label } from './Field';

export interface ProgressBarProps extends AriaProgressBarProps {
  label?: string;
}

export function ProgressBar({ label, ...props }: ProgressBarProps) {
  return (
    <AriaProgressBar {...props} className="flex flex-col gap-1">
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="flex justify-between gap-2">
            <Label>{label}</Label>
            <span className="text-sm text-gray-600">{valueText}</span>
          </div>
          <div className="w-64 h-2 rounded-full bg-gray-300 relative overflow-hidden">
            <div className={`absolute top-0 h-full rounded-full bg-blue-600 ${isIndeterminate ? 'left-full animate-in duration-1000 [--tw-enter-translate-x:calc(-16rem-100%)] slide-out-to-right-full repeat-infinite ease-out' : 'left-0'}`} style={{ width: (isIndeterminate ? 40 : percentage) + '%' }} />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}
