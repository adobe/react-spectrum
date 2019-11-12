import {HTMLAttributes, RefObject, useEffect} from 'react';
import {useId} from '@react-aria/utils';

interface OverlayTriggerProps {
  ref: RefObject<HTMLElement | null>,
  type: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid',
  onClose?: () => void,
  isOpen?: boolean
}

interface OverlayTriggerAria {
  triggerProps: HTMLAttributes<HTMLElement>,
  dialogProps: HTMLAttributes<HTMLElement>
}

export function useOverlayTrigger(props: OverlayTriggerProps): OverlayTriggerAria {
  let {ref, type, onClose, isOpen} = props;

  // When scrolling a parent scrollable region of the trigger (other than the body),
  // we hide the popover. Otherwise, its position would be incorrect.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let onScroll = (e: MouseEvent) => {
      // Ignore if scrolling an scrollable region outside the trigger's tree.
      let target = e.target as HTMLElement;
      if (target === document.body || !ref.current || !target.contains(ref.current)) {
        return;
      }

      if (onClose) {
        onClose();
      }
    };

    document.body.addEventListener('scroll', onScroll, true);
    return () => {
      document.body.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, onClose, ref]);

  let dialogId = useId();
  return {
    triggerProps: {
      // Aria 1.1 supports multiple values for aria-haspopup other than just menus.
      // https://www.w3.org/TR/wai-aria-1.1/#aria-haspopup
      // However, we only add it for menus for now because screen readers often 
      // announce it as a menu even for other values.
      'aria-haspopup': type === 'menu' ? true : undefined,
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? dialogId : null
    },
    dialogProps: {
      id: dialogId
    }
  };
}
