import {DOMPropsResponderContext} from './DOMPropsContext';
import {mergeProps} from '@react-aria/utils';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from './DOMPropsContext';
import {useHover} from './useHover';


import {filterDOMProps} from '@react-spectrum/utils';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {

  let domProps = useDOMPropsResponderContext({ref: domRef});
  // let domProps = useContext(DOMPropsResponderContext) || {};


  delete domProps.onPress;

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {register, isDisabled, ...partialDomProps} = domProps;


  // ^ instead use filterDOMProps with second override argument

  // put onPress in the filer as well?












  // let {hoverProps} = useHover({
  //   isDisabled
  // });

  return {
    contextProps: partialDomProps
  };
}
