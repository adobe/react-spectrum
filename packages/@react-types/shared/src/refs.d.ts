import {Ref} from 'react';

export interface DOMRefValue<T extends HTMLElement = HTMLElement> {
  UNSAFE_getDOMNode(): T
}

export interface FocusableRefValue<T extends HTMLElement = HTMLElement, D extends HTMLElement = T> extends DOMRefValue<D> {
  focus(): void
}

export type DOMRef<T extends HTMLElement = HTMLElement> = Ref<DOMRefValue<T>>;
export type FocusableRef<T extends HTMLElement = HTMLElement> = Ref<FocusableRefValue<T>>;
