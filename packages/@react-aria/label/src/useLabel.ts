import {DOMProps, LabelableProps} from '@react-types/shared';
import {HTMLAttributes, LabelHTMLAttributes} from 'react';
import {useId, useLabels} from '@react-aria/utils';

interface LabelAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  fieldProps: HTMLAttributes<HTMLElement>
}

export function useLabel(props: LabelableProps & DOMProps): LabelAria {
  let {
    id,
    label,
    'aria-labelledby': ariaLabelledby,
    'aria-label': ariaLabel
  } = props;

  id = useId(id);
  let labelId = useId();
  if (label) {
    ariaLabelledby = ariaLabelledby ? `${ariaLabelledby} ${labelId}` : labelId;
  } else if (!ariaLabelledby && !ariaLabel) {
    console.warn('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
  }

  let labelProps = label ? {
    id: labelId,
    htmlFor: id
  } : {};

  let fieldProps = useLabels({
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  });

  return {
    labelProps,
    fieldProps
  };
}
