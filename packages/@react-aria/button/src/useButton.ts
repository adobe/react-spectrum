import {chain, mergeProps} from '@react-aria/utils';
import {HoverHookProps, PressHookProps, useHover, usePress} from '@react-aria/interactions';
import {JSXElementConstructor, SyntheticEvent} from 'react';

interface AriaButtonProps extends PressHookProps, HoverHookProps {
  elementType?: string | JSXElementConstructor<any>,
  /**
   * for backwards compatibility
   */
  onClick?: (event: SyntheticEvent) => void,
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
  isPressed: boolean,
  isHovering: boolean
}

export function useButton(props: AriaButtonProps): ButtonAria {
  let {
    elementType = 'button',
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    onHover,
    onHoverChange,
    onHoverStart,
    onHoverEnd,
    onClick: deprecatedOnClick,
    href,
    tabIndex,
    isSelected,
    validationState,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    ref
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

  let {hoverProps, isHovering} = useHover({
    onHoverStart,
    onHoverEnd,
    onHoverChange,
    onHover,
    ref
  });

  let interactionProps = mergeProps(pressProps, hoverProps);

  return {
    isPressed,
    isHovering,
    buttonProps: mergeProps(interactionProps, {
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': ariaExpanded || (ariaHasPopup && isSelected),
      'aria-invalid': validationState === 'invalid' ? true : null,
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
