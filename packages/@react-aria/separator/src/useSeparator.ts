import {AllHTMLAttributes} from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
}

export interface SeparatorAria {
  separatorProps: AllHTMLAttributes<HTMLElement>
}

interface useSeparatorProps {}

export function useSeparator(props: SeparatorProps, elementType: string): SeparatorAria {
  let ariaOrientation;
  // if orientation is horizontal, aria-orientation default is horizontal, so we leave it undefined
  // if it's vertical, we need to specify it
  if (props.orientation === 'vertical') {
    ariaOrientation = 'vertical';
  }
  // hr elements implicitly have role = separator and a horizontal orientation
  let separatorProps = {} as useSeparatorProps;
  if (elementType.toLowerCase() !== 'hr') {
    separatorProps = {
      role: 'separator',
      'aria-orientation': ariaOrientation
    };
  }
  return {separatorProps};
}
