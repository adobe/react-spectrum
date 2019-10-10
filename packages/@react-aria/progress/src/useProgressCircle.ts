import {AllHTMLAttributes} from 'react';
import {clamp, useId} from '@react-aria/utils';
import {ProgressCircleProps} from '@react-types/progress';

interface ProgressCircleAria   {
  progressCircleProps: AllHTMLAttributes<HTMLDivElement>
}

export function useProgressCircle(props: ProgressCircleProps): ProgressCircleAria {
  let {
    id,
    value = 0,
    isIndeterminate = true,
    'aria-label': ariaLabel
  } = props;

  let min = 0;
  let max = 100;
  let ariaValueNow;

  if (!isIndeterminate) {
    ariaValueNow = clamp(value, min, max);
  }

  if (!ariaLabel) {
    console.warn('You must specify an aria-label for accessibility');
  }

  return {
    progressCircleProps: {
      id: useId(id),
      'aria-label': ariaLabel,
      'aria-valuenow': ariaValueNow,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuetext': `${ariaValueNow}%`,
      role: 'progressbar'
    }
  };
}
