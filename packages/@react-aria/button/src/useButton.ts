import {ButtonProps} from '@react-types/button';
import {chain, mergeProps} from '@react-aria/utils';
import {RefObject} from 'react';
import {useFocusable} from '@react-aria/focus';
import {usePress} from '@react-aria/interactions';

interface AriaButtonProps extends ButtonProps {
  isSelected?: boolean,
  validationState?: 'valid' | 'invalid', // used by FieldButton (e.g. DatePicker, ComboBox)
  'aria-expanded'?: boolean | 'false' | 'true',
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog',
  type?: 'button' | 'submit'
}

interface ButtonAria {
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>,
  isPressed: boolean
}

export function useButton(props: AriaButtonProps, ref: RefObject<HTMLElement>): ButtonAria {
  let {
    elementType = 'button',
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    // @ts-ignore
    onClick: deprecatedOnClick,
    href,
    target,
    tabIndex,
    isSelected,
    validationState,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    type = 'button'
  } = props;
  let additionalProps;
  if (elementType !== 'button') {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : (tabIndex || 0),
      href: elementType === 'a' && isDisabled ? undefined : href,
      target: elementType === 'a' ? target : undefined,
      type: elementType === 'input' ? type : undefined,
      disabled: elementType === 'input' ? isDisabled : undefined,
      'aria-disabled': !isDisabled || elementType === 'input' ? undefined : isDisabled
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
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(handlers, {
      'aria-haspopup': ariaHasPopup,
      'aria-expanded': ariaExpanded || (ariaHasPopup && isSelected),
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
