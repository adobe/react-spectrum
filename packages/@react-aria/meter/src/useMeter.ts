import {AllHTMLAttributes} from 'react';
import {DOMProps} from '@react-types/shared';
import {ProgressBarBaseProps} from '@react-types/progress';
import {useProgressBar} from '@react-aria/progress';

interface MeterAria {
  meterProps: AllHTMLAttributes<HTMLDivElement>,
  labelProps: AllHTMLAttributes<HTMLLabelElement>
}

interface MeterAriaProps extends ProgressBarBaseProps, DOMProps {
  textValue?: string
}

export function useMeter(props: MeterAriaProps): MeterAria {
  let {progressBarProps, labelProps} = useProgressBar(props);

  return {
    meterProps: {
      ...progressBarProps,
      // Use the meter role if available, but fall back to progressbar if not
      // Chrome currently falls back from meter automatically, and Firefox
      // does not support meter at all. Safari 13+ seems to support meter properly.
      // https://bugs.chromium.org/p/chromium/issues/detail?id=944542
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1460378
      role: 'meter progressbar'
    },
    labelProps
  };
}
