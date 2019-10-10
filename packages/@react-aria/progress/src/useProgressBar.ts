import {AllHTMLAttributes} from 'react';
import {clamp} from '@react-aria/utils';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';
import {useNumberFormatter} from '@react-aria/i18n';

type LabelProps = {
  formattedValueLabel: string
}

type BarProps = {
  percentage: number
}

interface ProgressBarAria   {
  progressBarProps: AllHTMLAttributes<HTMLDivElement>,
  labelAriaProps: AllHTMLAttributes<HTMLDivElement>,
  labelProps: LabelProps,
  barProps: BarProps
}

const DEFAULT_FORMAT_STYLE = 'percent';
export function useProgressBar(props: ProgressBarProps): ProgressBarAria {
  let {
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
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

  const {labelAriaProps, labelledComponentAriaProps} = useLabel({id}, {'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby});

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

  if (ariaLabelledby || children) {
    ariaLabelledby = labelledComponentAriaProps['aria-labelledby'];
  }

  return {
    progressBarProps: {
      ...labelledComponentAriaProps,
      'aria-valuenow': valueNow,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuetext': formattedValueLabel,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      role: 'progressbar'
    },
    labelAriaProps,
    labelProps: {
      formattedValueLabel
    },
    barProps: {
      percentage
    }
  };
}
