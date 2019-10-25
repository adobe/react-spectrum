import {AllHTMLAttributes} from 'react';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';

interface ProgressBarAria {
  progressBarProps: AllHTMLAttributes<HTMLDivElement>,
  labelProps: AllHTMLAttributes<HTMLDivElement>
}

export function useProgressBar(props: ProgressBarProps): ProgressBarAria {
  let {
    id,
    value = 0,
    min = 0,
    max = 100,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-valuetext': valueText,
    isIndeterminate,
    children
  } = props;

  if (!children && !ariaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }

  const {labelAriaProps, labelledComponentAriaProps} = useLabel({id}, {'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby});

  let ariaValueNow;
  let ariaValueText;
  if (!isIndeterminate) {
    ariaValueNow = value;
    ariaValueText = valueText || `${value}%`;
  }

  if (ariaLabelledby || children) {
    ariaLabelledby = labelledComponentAriaProps['aria-labelledby'];
  }

  return {
    progressBarProps: {
      ...labelledComponentAriaProps,
      'aria-valuenow': ariaValueNow,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuetext': ariaValueText,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      role: 'progressbar'
    },
    labelProps: labelAriaProps
  };
}
