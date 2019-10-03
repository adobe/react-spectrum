import {AllHTMLAttributes} from 'react';
import {ProgressCircleProps} from '@react-types/progress';
import {useId} from '@react-aria/utils';

interface ProgressCircleAria   {
  ariaProps: AllHTMLAttributes<HTMLDivElement>
}

export function useProgressCircle(props: ProgressCircleProps): ProgressCircleAria {
  let {
    id,
    value = 0,
    isIndeterminate = true,
    'aria-label': ariaLabel
  } = props;

  let ariaValueMin = 0;
  let ariaValueMax = 100;
  let ariaValueNow;

  if (!isIndeterminate) {
    ariaValueNow = Math.min(Math.max(+value, 0), 100);
  }

  if (!ariaLabel) {
    console.warn('You must specify an aria-label for accessibility');
  }

  return {
    ariaProps: {
      id: useId(id),
      'aria-label': ariaLabel,
      'aria-valuenow': ariaValueNow,
      'aria-valuemin': ariaValueMin,
      'aria-valuemax': ariaValueMax,
      'aria-valuetext': `${ariaValueNow}%`,
      role: 'progressbar'
    }
  };
}
