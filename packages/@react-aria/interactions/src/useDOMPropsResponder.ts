import {RefObject} from 'react';
import {useDOMPropsResponderContext} from './DOMPropsContext';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {

  let domProps = useDOMPropsResponderContext({ref: domRef}) || {};

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {register, isDisabled, onPress, ...partialDomProps} = domProps;
  // lgtm 

  return {
    contextProps: partialDomProps
  };
}
