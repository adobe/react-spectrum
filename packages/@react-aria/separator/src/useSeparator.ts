import {AllHTMLAttributes, ElementType} from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical',
  elementType?: ElementType
}

export interface SeparatorAria {
  separatorProps: AllHTMLAttributes<HTMLElement>
}

export function useSeparator(props: SeparatorProps): SeparatorAria {
  let ariaOrientation;
  // if orientation is horizontal, aria-orientation default is horizontal, so we leave it undefined
  // if it's vertical, we need to specify it
  if (props.orientation === 'vertical') {
    ariaOrientation = 'vertical';
  }
  // hr elements implicitly have role = separator and a horizontal orientation
  if (props.elementType !== 'hr') {
    return {
      separatorProps: {
        role: 'separator',
        'aria-orientation': ariaOrientation
      }
    };
  }
  return {separatorProps: {}};
}
