import {chain, mergeProps} from '@react-aria/utils';
import {JSXElementConstructor} from 'react';
import {PressHookProps, usePress} from '@react-aria/interactions';
import {useFocusable} from '@react-aria/focus';

interface AriaButtonProps extends PressHookProps {
  elementType?: string | JSXElementConstructor<any>,
  href?: string,
  tabIndex?: number,
  isSelected?: boolean | 'false' | 'true',
  validationState?: 'valid' | 'invalid',
  'aria-expanded'?: boolean | 'false' | 'true',
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog',
  [others: string]: any
}

interface ButtonAria {
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>,
  isPressed: boolean
}

export function useButton(props: AriaButtonProps): ButtonAria {
  let {
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
    validationState,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    ref,
    type = 'button'
  } = props;
  let additionalProps;
  if (elementType !== 'button') {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : (tabIndex || 0),
      'aria-disabled': isDisabled || undefined,
      href: elementType === 'a' && isDisabled ? undefined : href
    };
  }

  let {pressProps, isPressed} = usePress({
    // Safari does not focus buttons automatically when interacting with them, so do it manually
    onPressStart: chain(onPressStart, (e) => e.target.focus()),
    onPressEnd: chain(onPressEnd, (e) => e.target.focus()),
    onPressChange,
    onPress,
    isDisabled,
    ref
  });

  let {focusableProps} = useFocusable(props, ref);
  let handlers = mergeProps(pressProps, focusableProps);

  return {
    isPressed,
    buttonProps: mergeProps(handlers, {
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': ariaExpanded || (ariaHasPopup && isSelected),
      'aria-checked': isSelected,
      'aria-invalid': validationState === 'invalid' ? true : null,
      disabled: isDisabled,
      type,
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
