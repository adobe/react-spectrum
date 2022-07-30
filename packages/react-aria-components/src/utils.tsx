import {mergeProps, mergeRefs, useLayoutEffect, useObjectRef} from '@react-aria/utils';
import React, {CSSProperties, ReactNode, RefCallback, useCallback, useContext, useRef, useState} from 'react';

interface SlottedValue<T> {
  slots: Record<string, T>
}

type ProviderValue<T> = [React.Context<T>, SlottedValue<T> | T];
type ProviderValues<A, B, C, D, E, F, G> =
  | [ProviderValue<A>]
  | [ProviderValue<A>, ProviderValue<B>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>, ProviderValue<G>];

interface ProviderProps<A, B, C, D, E, F, G> {
  values: ProviderValues<A, B, C, D, E, F, G>,
  children: React.ReactNode
}

export function Provider<A, B, C, D, E, F, G>({values, children}: ProviderProps<A, B, C, D, E, F, G>): JSX.Element {
  for (let [Context, value] of values) {
    // @ts-ignore
    children = <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return children as JSX.Element;
}

export interface StyleProps {
  className?: string,
  style?: CSSProperties
}

export interface DOMProps extends StyleProps {
  children?: ReactNode
}

export interface RenderProps<T> {
  className?: string | ((values: T) => string),
  style?: CSSProperties | ((values: T) => CSSProperties),
  children?: ReactNode | ((values: T) => ReactNode)
}

interface RenderPropsHookOptions<T> extends RenderProps<T> {
  values: T,
  defaultChildren?: ReactNode
}

export function useRenderProps<T>({className, style, children, defaultChildren, values}: RenderPropsHookOptions<T>) {
  if (typeof className === 'function') {
    className = className(values);
  }

  if (typeof style === 'function') {
    style = style(values);
  }

  if (typeof children === 'function') {
    children = children(values);
  } else if (children == null) {
    children = defaultChildren;
  }

  return {
    className,
    style,
    children
  };
}

export type WithRef<T, E> = T & {ref?: React.ForwardedRef<E>};
export interface SlotProps {
  slot?: string
}

export function useContextProps<T, U, E extends Element>(props: T & SlotProps, ref: React.ForwardedRef<E>, context: React.Context<WithRef<SlottedValue<U> | U, E>>): [T, React.RefObject<E>] {
  let {ref: contextRef, ...contextProps} = useContext(context) || {};
  if ('slots' in contextProps) {
    if (!props.slot) {
      throw new Error('A slot prop is required');
    }
    if (!contextProps.slots[props.slot]) {
      // @ts-ignore
      throw new Error(`Invalid slot "${props.slot}". Valid slot names are ` + new Intl.ListFormat().format(Object.keys(contextProps.slots).map(p => `"${p}"`)) + '.');
    }
    contextProps = contextProps.slots[props.slot];
  }
  let mergedRef = useObjectRef(mergeRefs(ref, contextRef));
  let mergedProps = mergeProps(contextProps, props) as unknown as T;
  return [mergedProps, mergedRef];
}

export function useSlot(): [RefCallback<Element>, boolean] {
  // Assume we do have the slot in the initial render.
  let [hasSlot, setHasSlot] = useState(true);
  let hasRun = useRef(false);

  // A callback ref which will run when the slotted element mounts.
  // This should happen before the useLayoutEffect below.
  let ref = useCallback(el => {
    hasRun.current = true;
    setHasSlot(!!el);
  }, []);

  // If the callback hasn't been called, then reset to false.
  useLayoutEffect(() => {
    if (!hasRun.current) {
      setHasSlot(false);
    }
  }, []);

  return [ref, hasSlot];
}
