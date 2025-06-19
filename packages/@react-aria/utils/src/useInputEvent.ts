import {RefObject, useEffect} from 'react';

export function useInputEvent<T>(
  ref: RefObject<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement | null>,
  subscribe: (fn: (value: T) => void) => () => void,
  type?: 'input' | 'change'
): void {
  useEffect(() => {
    return subscribe(value => {
      let el = ref.current;
      if (el && window.event?.type !== 'reset') {
        // Use native input element value property setter from the element's prototype.
        // React overrides the setter directly on the element and ignores the input event.
        // This matches more closely what the browser does natively (setter is not triggered).
        // See https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js
        let proto = Object.getPrototypeOf(el);
        let setValue = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
        setValue.call(el, String(value ?? ''));
        
        if (!type || type === 'input') {
          let inputEvent = new Event('input', {bubbles: true});
          inputEvent['__reactAriaIgnore'] = true;
          el.dispatchEvent(inputEvent);
        }
        
        if (!type || type === 'change') {
          let changeEvent = new Event('change', {bubbles: true});
          changeEvent['__reactAriaIgnore'] = true;
          el.dispatchEvent(changeEvent);
        }
      }
    });
  }, [ref, subscribe, type]);
}
