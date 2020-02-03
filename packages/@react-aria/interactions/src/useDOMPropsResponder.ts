import {DOMPropsResponderContext} from './DOMPropsContext';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from './DOMPropsContext';
import {useHover} from './useHover';
import {mergeProps} from '@react-aria/utils';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  useDOMPropsResponderContext({ref: domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};

  let {hoverProps} = useHover({
    isDisabled: undefined ? false : true
  });
  // @ts-ignore
  delete domProps.onPress;
  // @ts-ignore
  const {register, isDisabled, ...partialDomProps} = domProps;

  return {
    contextProps: mergeProps(partialDomProps, hoverProps)
  };
}
