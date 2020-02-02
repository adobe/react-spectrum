import {DOMPropsResponderContext} from '@react-aria/interactions';
import {RefObject, useContext} from 'react';
import {useDOMPropsResponderContext} from '@react-aria/interactions';

// import {filterDOMProps} from '@react-spectrum/utils';

export function useDOMPropsResponder(domRef: RefObject<HTMLElement>) {
  useDOMPropsResponderContext({ref: domRef});
  let domProps = useContext(DOMPropsResponderContext) || {};

  // console.log("unfiltered", domProps)
  // filterDOMProps(domProps)
  // console.log("filtered", domProps)

  return domProps;

  // return {...filterDOMProps(domProps)}
  /*
       ^ this only returns id & aria-describedby. Any other way to stop console warnings such as:

       react-dom.development.js:558 Warning: React does not recognize the `isDisabled` prop on a DOM element.
       If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `isdisabled` instead.
       If you accidentally passed it from a parent component, remove it from the DOM element.
  */

}
