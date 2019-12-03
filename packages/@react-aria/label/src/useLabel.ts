import {AllHTMLAttributes} from 'react';
import {LabelProps} from '@react-types/label';
import {useId} from '@react-aria/utils';

export function useLabel(labelProps: LabelProps = {}, labelledComponentProps: AllHTMLAttributes<HTMLElement> = {}) {
  let {
    id: labelId,
    labelFor, // RSP prop
    htmlFor
  } = labelProps;

  let {
    id: labelledComponentId,
    'aria-labelledby': ariaLabelledby,
    'aria-label': ariaLabel
  } = labelledComponentProps;

  labelId = useId(labelId);
  labelledComponentId = useId(labelledComponentId);
  let labelAriaProps: AllHTMLAttributes<HTMLElement> = {
    id: labelId,
    // htmlFor attribute can only reference a single id hence no concat, prioritize user set htmlFor attribute
    // htmlFor is a React way to specify the "for" attribute since "for" is a reserved word in JS 
    htmlFor: htmlFor || labelFor || labelledComponentId 
  };

  if (ariaLabelledby) {
    // If a element is labelled by multiple elements, we need to concat each of the ids separated by a space
    if (ariaLabelledby !== labelId) {
      ariaLabelledby = `${ariaLabelledby} ${labelId}`;
    }
  } else {
    ariaLabelledby = labelId;
  }

  if (ariaLabel) {
    // If a element has a aria-label and an aria-labelledby, it needs to have it's own id added to the aria-labelledby
    ariaLabelledby = `${ariaLabelledby} ${labelledComponentId}`;
  }

  let labelledComponentAriaProps: AllHTMLAttributes<HTMLElement> = {
    id: labelledComponentId, 
    'aria-labelledby': ariaLabelledby
  };

  return {
    labelAriaProps,
    labelledComponentAriaProps
  };
}
