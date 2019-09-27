import {AllHTMLAttributes, CSSProperties} from 'react';
import {ProgressCircleProps} from '@react-types/progress';

interface ProgressCircleAria   {
  progressProps: AllHTMLAttributes<HTMLDivElement>,
  subMask1Style: CSSProperties,
  subMask2Style: CSSProperties
}

export function useProgressCircle({
  value = 0,
  isIndeterminate = true
}: ProgressCircleProps): ProgressCircleAria {

  let ariaValueMin = 0;
  let ariaValueMax = 100;
  let ariaValueNow;

  let transformSubMask1;
  let transformSubMask2;

  if (!isIndeterminate) {
    let angle;
    value = Math.min(Math.max(+value, 0), 100);
    ariaValueNow = value;
    if (value > 0 && value <= 50) {
      angle = -180 + (value / 50 * 180);
      transformSubMask1 = 'rotate(' + angle + 'deg)';
      transformSubMask2 = 'rotate(-180deg)';
    } else if (value > 50) {
      angle = -180 + (value - 50) / 50 * 180;
      transformSubMask1 = 'rotate(0deg)';
      transformSubMask2 = 'rotate(' + angle + 'deg)';
    }
  }

  return {
    progressProps: {
      'aria-valuenow': ariaValueNow,
      'aria-valuemin': ariaValueMin,
      'aria-valuemax': ariaValueMax,
      role: 'progressbar'
    },
    subMask1Style: {
      transform: transformSubMask1
    },
    subMask2Style: {
      transform: transformSubMask2
    }
  };
}
