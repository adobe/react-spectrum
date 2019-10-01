import {AllHTMLAttributes, CSSProperties} from 'react';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';
import {useNumberFormatter} from '@react-aria/i18n';

interface ProgressBarAria   {
  ariaProps: AllHTMLAttributes<HTMLDivElement>,
  labelAriaProps: AllHTMLAttributes<HTMLDivElement>,
  fillStyle: CSSProperties,
  formattedValueLabel: string
}

const DEFAULT_FORMAT_STYLE = 'percent';

export function useProgressBar({
  'aria-label': ariaLabel,
  value = 0,
  min = 0,
  max = 100,
  isIndeterminate = false,
  formatOptions = {
    style: DEFAULT_FORMAT_STYLE
  },
  children
}: ProgressBarProps): ProgressBarAria {

  if (!children && !ariaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }

  const {labelAriaProps, labelledComponentAriaProps} = useLabel({}, {'aria-label': ariaLabel});

  let percentage = Math.min(Math.max(+value, min), max) / (max - min);
  let width;
  if (!isIndeterminate) {
    width = `${100 * percentage}%`;
  }

  let valueNow = formatOptions.style === DEFAULT_FORMAT_STYLE ? percentage : value;
  let formattedValueLabel = useNumberFormatter(formatOptions).format(valueNow);

  return {
    ariaProps: {
      'aria-valuenow': valueNow,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuetext': formattedValueLabel,
      'aria-label': ariaLabel,
      'aria-labelledby': children && labelledComponentAriaProps['aria-labelledby'],
      'id': labelledComponentAriaProps.id,
      role: 'progressbar'
    },
    labelAriaProps,
    fillStyle: {
      width
    },
    formattedValueLabel
  };
}
