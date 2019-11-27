import {AllHTMLAttributes} from 'react';
import {DOMProps} from '@react-types/shared';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';

interface ProgressBarAria {
  progressBarProps: AllHTMLAttributes<HTMLDivElement>,
  labelProps: AllHTMLAttributes<HTMLDivElement>
}

interface ProgressBarAriaProps extends ProgressBarProps, DOMProps {
  textValue?: string
}

export function useProgressBar(props: ProgressBarAriaProps): ProgressBarAria {
  let {
    id,
    value = 0,
    min = 0,
    max = 100,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    textValue,
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
    ariaValueText = textValue || `${value}%`;
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
