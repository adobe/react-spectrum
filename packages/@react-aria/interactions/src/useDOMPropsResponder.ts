import {DOMPropsResponderContext} from '@react-aria/interactions';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from '@react-aria/interactions';

import {useHover} from '@react-aria/interactions';
import {mergeProps} from '@react-aria/utils';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  useDOMPropsResponderContext({ref: domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};

  let {hoverProps} = useHover({
    isDisabled: undefined ? false : true,
  });

  delete domProps.onPress;

  const {register, isDisabled, ...partialDomProps} = domProps;

  return {
    contextProps: mergeProps(partialDomProps, hoverProps)
  };
}
