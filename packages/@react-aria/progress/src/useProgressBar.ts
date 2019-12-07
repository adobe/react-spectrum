import {AllHTMLAttributes} from 'react';
import {clamp} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';
import {useNumberFormatter} from '@react-aria/i18n';

interface ProgressBarAria {
  progressBarProps: AllHTMLAttributes<HTMLDivElement>,
  labelProps: AllHTMLAttributes<HTMLLabelElement>
}

interface ProgressBarAriaProps extends ProgressBarProps, DOMProps {
  textValue?: string
}

export function useProgressBar(props: ProgressBarAriaProps): ProgressBarAria {
  let {
    id,
    value = 0,
    minValue = 0,
    maxValue = 100,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    textValue,
    isIndeterminate,
    children,
    formatOptions = {
      style: 'percent'
    }
  } = props;

  const {labelAriaProps, labelledComponentAriaProps} = useLabel({id}, {'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby});

  value = clamp(value, minValue, maxValue);
  let percentage = (value - minValue) / (maxValue - minValue);
  let formatter = useNumberFormatter(formatOptions);

  if (!isIndeterminate && !textValue) {
    let valueToFormat = formatOptions.style === 'percent' ? percentage : value;
    textValue = formatter.format(valueToFormat);
  }

  if (ariaLabelledby || children) {
    ariaLabelledby = labelledComponentAriaProps['aria-labelledby'];
  }

  return {
    progressBarProps: {
      ...labelledComponentAriaProps,
      'aria-valuenow': isIndeterminate ? undefined : value,
      'aria-valuemin': minValue,
      'aria-valuemax': maxValue,
      'aria-valuetext': isIndeterminate ? undefined : textValue,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      role: 'progressbar'
    },
    labelProps: labelAriaProps
  };
}
