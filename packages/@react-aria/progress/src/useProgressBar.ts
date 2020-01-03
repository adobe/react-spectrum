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
    value = 0,
    minValue = 0,
    maxValue = 100,
    textValue,
    isIndeterminate,
    formatOptions = {
      style: 'percent'
    }
  } = props;

  let {labelProps, fieldProps} = useLabel({
    ...props,
    // Progress bar is not an HTML input element so it 
    // shouldn't be labeled by a <label> element.
    labelElementType: 'span'
  });

  value = clamp(value, minValue, maxValue);
  let percentage = (value - minValue) / (maxValue - minValue);
  let formatter = useNumberFormatter(formatOptions);

  if (!isIndeterminate && !textValue) {
    let valueToFormat = formatOptions.style === 'percent' ? percentage : value;
    textValue = formatter.format(valueToFormat);
  }

  return {
    progressBarProps: {
      ...fieldProps,
      'aria-valuenow': isIndeterminate ? undefined : value,
      'aria-valuemin': minValue,
      'aria-valuemax': maxValue,
      'aria-valuetext': isIndeterminate ? undefined : textValue,
      role: 'progressbar'
    },
    labelProps
  };
}
