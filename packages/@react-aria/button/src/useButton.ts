import {ButtonProps} from '@react-types/button';
import {chain, mergeProps} from '@react-aria/utils';
import {DOMPropsResponderContext} from '@react-aria/interactions';
import {RefObject, useContext} from 'react';
import {useFocusable} from '@react-aria/focus';
import {useDOMPropsResponderContext, usePress} from '@react-aria/interactions';

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

  // 1TODO: pull the two following lines out into a seperate file called useDOMPropsResponder
    // accepts a ref as an argument
    // returns contextProps
  useDOMPropsResponderContext({ref});
  let contextProps = useContext(DOMPropsResponderContext) || {};

  let {focusableProps} = useFocusable(props, ref);
  let handlers = mergeProps(pressProps, focusableProps);
  let interactions = mergeProps(contextProps, handlers);

  return {
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(interactions, {
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
