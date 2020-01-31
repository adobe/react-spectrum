import {DOMPropsResponderContext} from '@react-aria/interactions';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from '@react-aria/interactions';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  // @ts-ignore
  useDOMPropsResponderContext({ref: domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};
  return domProps;
}
