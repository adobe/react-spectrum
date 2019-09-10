import {DOMProps} from '@react-types/shared';
import {useId} from './useId';

export function useLabels(props: DOMProps, defaultLabel?: string): DOMProps {
  let {
    id,
    'aria-label': label,
    'aria-labelledby': labelledBy
  } = props;

  // If there is both an aria-label and aria-labelledby, 
  // combine them by pointing to the element itself.
  id = useId(id);
  if (labelledBy && label) {
    let ids = new Set([...labelledBy.trim().split(/\s+/), id]);
    labelledBy = [...ids].join(' ');
  } else if (labelledBy) {
    labelledBy = labelledBy.trim().split(/\s+/).join(' ');
  }

  // If no labels are provided, use the default
  if (!label && !labelledBy && defaultLabel) {
    label = defaultLabel;
  }

  return {
    id,
    'aria-label': label,
    'aria-labelledby': labelledBy
  };
}
