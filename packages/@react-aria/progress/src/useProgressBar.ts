import {AllHTMLAttributes} from 'react';
import {clamp} from '@react-aria/utils';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';
import {useNumberFormatter} from '@react-aria/i18n';

interface ProgressBarAria   {
  ariaProps: AllHTMLAttributes<HTMLDivElement>,
  labelAriaProps: AllHTMLAttributes<HTMLDivElement>,
  formattedValueLabel: string,
  percentage: number
}

const DEFAULT_FORMAT_STYLE = 'percent';
export function useProgressBar(props: ProgressBarProps): ProgressBarAria {
  let {
    id,
    'aria-label': ariaLabel,
    value = 0,
    min = 0,
    max = 100,
    formatOptions = {
      style: DEFAULT_FORMAT_STYLE
    },
    children
  } = props;

  if (!children && !ariaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }

  const {labelAriaProps, labelledComponentAriaProps} = useLabel({id}, {'aria-label': ariaLabel});

  let decimalPercentage = clamp(value, min, max) / (max - min);
  let percentage = 100 * decimalPercentage;

  let valueNow, formattedValueLabel;
  let formatter = useNumberFormatter(formatOptions);
  if (formatOptions.style === DEFAULT_FORMAT_STYLE) {
    formattedValueLabel = formatter.format(decimalPercentage);
    valueNow = percentage;
  } else {
    formattedValueLabel = formatter.format(value);
    valueNow = value;
  }

  return {
    ariaProps: {
      id: labelledComponentAriaProps.id,
      'aria-valuenow': valueNow,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuetext': formattedValueLabel,
      'aria-label': ariaLabel,
      'aria-labelledby': children && labelAriaProps.id,
      role: 'progressbar'
    },
    labelAriaProps,
    formattedValueLabel,
    percentage
  };
}
