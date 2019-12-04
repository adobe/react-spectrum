import {AllHTMLAttributes} from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
}

export interface SeparatorAria {
  separatorProps: AllHTMLAttributes<HTMLElement>
}

export function useSeparator(props: SeparatorProps, elementType: string): SeparatorAria {
  let ariaOrientation;
  // if orientation is horizontal, aria-orientation default is horizontal, so we leave it undefined
  // if it's vertical, we need to specify it
  if (props.orientation === 'vertical') {
    ariaOrientation = 'vertical';
  }
  // hr elements implicitly have role = separator
  if (elementType !== 'HR') {
    return {
      separatorProps: {
        role: 'separator',
        'aria-orientation': ariaOrientation
      }
    };
  }
  // Horizontal Divider is rendered using <hr> and therefore also implicitly has a role = separator
  if (props.orientation === 'horizontal') {
    return {separatorProps: {'aria-orientation': ariaOrientation}};
  }
  return {separatorProps: {'aria-orientation': ariaOrientation}};
}
