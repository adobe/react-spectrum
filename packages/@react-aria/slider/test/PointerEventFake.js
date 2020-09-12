/*
  This exists because  JSDOM's PointerEvent doesn't work right.
  see: https://github.com/jsdom/jsdom/pull/2666.
  and https://github.com/testing-library/dom-testing-library/issues/558.
*/

const pointerEventCtorProps = ['clientX', 'clientY', 'pointerType'];
export default class PointerEventFake extends Event {
  constructor(type, props = {}) {
    super(type, props);
    pointerEventCtorProps.forEach((prop) => {
      if (props[prop] != null) {
        this[prop] = props[prop];
      }
    });
  }
}
