import {DOMProps, LabelableProps} from '@react-types/shared';
import {ElementType, HTMLAttributes, LabelHTMLAttributes} from 'react';
import {useId, useLabels} from '@react-aria/utils';

interface LabelAriaProps extends LabelableProps, DOMProps {
  labelElementType?: ElementType
}

interface LabelAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  fieldProps: HTMLAttributes<HTMLElement>
}

export function useLabel(props: LabelAriaProps): LabelAria {
  let {
    id,
    label,
    'aria-labelledby': ariaLabelledby,
    'aria-label': ariaLabel,
    labelElementType = 'label'
  } = props;

  id = useId(id);
  let labelId = useId();
  let labelProps = {};
  if (label) {
    ariaLabelledby = ariaLabelledby ? `${ariaLabelledby} ${labelId}` : labelId;
    labelProps = {
      id: labelId,
      htmlFor: labelElementType === 'label' ? id : undefined
    };
  } else if (!ariaLabelledby && !ariaLabel) {
    console.warn('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
  }

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
