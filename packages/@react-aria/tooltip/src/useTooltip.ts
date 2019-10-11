import {AllHTMLAttributes, RefObject, useEffect} from 'react';

interface TooltipProps {
  ref: RefObject<HTMLElement | null>,
  role?: 'tooltip'
}

interface TooltipAria { // extends AllHTMLAttributes
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip({ref, role = 'tooltip'}: TooltipProps): TooltipAria {
  // Focus the dialog itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (ref.current && !ref.current.contains(document.activeElement)) {
      ref.current.focus();
    }
  }, [ref]);

  return {
    tooltipProps: {
      role,
      tabIndex: -1
    }
  };
}
