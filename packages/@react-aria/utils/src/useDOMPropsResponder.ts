import {DOMPropsResponderContext} from '@react-aria/interactions';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from '@react-aria/interactions';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  useDOMPropsResponderContext({ref: domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};

  console.log("domProps", domProps)

  delete domProps.onPress;
  delete domProps.isDisabled;
  //delete domProps.register;

  return domProps;

}
