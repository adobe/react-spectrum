import {chain, mergeProps} from '@react-aria/utils';
import {JSXElementConstructor, SyntheticEvent} from 'react';
import {PressProps, usePress} from '@react-aria/interactions';

interface AriaButtonProps extends PressProps {
  elementType?: string | JSXElementConstructor<any>,
  /**
   * for backwards compatibility
   */
  onClick?: (event: SyntheticEvent) => void,
  href?: string,
  tabIndex?: number,
  isSelected?: boolean | 'false' | 'true',
  'aria-expanded'?: boolean | 'false' | 'true',
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

interface ButtonAria {
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export function useButton({
  elementType = 'button',
  isDisabled,
  onPress,
  onPressStart,
  onPressEnd,
  onPressChange,
  onClick: deprecatedOnClick,
  href,
  tabIndex,
  isSelected,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup
}: AriaButtonProps): ButtonAria {
  let additionalProps;
  if (elementType !== 'button') {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : (tabIndex || 0),
      'aria-disabled': isDisabled || undefined,
      href: elementType === 'a' && isDisabled ? undefined : href
    };
  }

  let {pressProps} = usePress({
    // Safari does not focus buttons automatically when interacting with them, so do it manually
    onPressStart: chain(onPressStart, (e) => e.target.focus()),
    onPressEnd: chain(onPressEnd, (e) => e.target.focus()),
    onPressChange,
    onPress,
    isDisabled
  });

  return {
    buttonProps: mergeProps(pressProps, {
      'aria-expanded': ariaExpanded || (ariaHasPopup && isSelected),
      disabled: isDisabled,
      ...(additionalProps || {}),
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    })
  };
}
