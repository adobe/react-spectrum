import {HTMLButtonElement, HTMLElement} from 'react-dom';
import React, {JSXElementConstructor, MouseEvent, useRef} from 'react';

interface AriaButtonProps {
  elementType?: string | JSXElementConstructor<any>,
  isDisabled?: boolean | 'false' | 'true',
  onPress?: (event: Event) => void,
  /**
   * for backwards compatibility
   */
  onClick?: (event: MouseEvent<HTMLElement>)=> void,
  href?: string,
  tabIndex?: number,
  isSelected?: boolean | 'false' | 'true',
  'aria-expanded'?: boolean | 'false' | 'true',
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

interface ButtonAria {
  buttonProps: React.AllHTMLAttributes<HTMLElement>
}

export function useButton({
  elementType = 'button',
  isDisabled,
  onPress,
  onClick: deprecatedOnClick,
  href,
  tabIndex,
  isSelected,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup
}: AriaButtonProps): ButtonAria {
  let buttonRef = useRef<HTMLButtonElement | null>(null);

  let onKeyDownSpace = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      buttonRef.current.click();
    }
  };

  let onClick = (event) => {
    // This is needed when `element` is an anchor or something similar.
    // When `element` is a button, we won't even get here if it's disabled and clicked.
    if (isDisabled) {
      // If the element is an anchor with an href, we need to preventDefault() or the browser
      // will follow the link.
      event.preventDefault();
    } else if (onPress) {
      onPress(event);
    } else if (deprecatedOnClick) {
      deprecatedOnClick(event);
      console.warn('onClick is deprecated, please use onPress');
    }
  };

  let additionalProps;
  if (elementType !== 'button') {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : (tabIndex || 0),
      'aria-disabled': isDisabled || undefined,
      href: elementType === 'a' && isDisabled ? undefined : href,
      onKeyDown: isDisabled ? undefined : onKeyDownSpace
    };
  }

  return {
    buttonProps: {
      onClick,
      ref: buttonRef,
      'aria-expanded': ariaExpanded || (ariaHasPopup && isSelected),
      disabled: isDisabled,
      ...(additionalProps || {})
    }
  };
}
