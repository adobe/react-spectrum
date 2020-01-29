//TODO: move to utils to avoid interactions package needing to import itself?
import {DOMPropsResponderContext} from '@react-aria/interactions';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from '@react-aria/interactions';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  // @ts-ignore
  useDOMPropsResponderContext({domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};
  return domProps;
}
