import {DOMPropsResponderContext} from './DOMPropsContext';
import {mergeProps} from '@react-aria/utils';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from './DOMPropsContext';
import {useHover} from './useHover';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  useDOMPropsResponderContext({ref: domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};

  // @ts-ignore
  delete domProps.onPress;
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {register, isDisabled, ...partialDomProps} = domProps;

  let {hoverProps} = useHover({
    isDisabled
  });

  return {
    contextProps: mergeProps(partialDomProps, hoverProps)
  };
}
