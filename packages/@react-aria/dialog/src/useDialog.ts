import {AllHTMLAttributes, RefObject, useEffect} from 'react';

interface DialogProps {
  ref: RefObject<HTMLElement | null>,
  role?: 'dialog' | 'alertdialog'
}

interface DialogAria {
  dialogProps: AllHTMLAttributes<HTMLElement>
}

export function useDialog({ref, role = 'dialog'}: DialogProps): DialogAria {
  // Focus the dialog itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (ref.current && !ref.current.contains(document.activeElement)) {
      ref.current.focus();
    }
  }, [ref]);

  return {
    dialogProps: {
      role,
      tabIndex: -1
    }
  };
}
