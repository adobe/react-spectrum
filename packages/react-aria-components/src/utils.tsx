import {mergeProps, mergeRefs, useObjectRef} from '@react-aria/utils';
import React, {CSSProperties, ReactNode, useContext} from 'react';

type ProviderValue<T> = [React.Context<T>, T];
type ProviderValues<A, B, C, D, E> =
  | [ProviderValue<A>]
  | [ProviderValue<A>, ProviderValue<B>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>];

interface ProviderProps<A, B, C, D, E> {
  values: ProviderValues<A, B, C, D, E>,
  children: React.ReactNode
}

export function Provider<A, B, C, D, E>({values, children}: ProviderProps<A, B, C, D, E>): JSX.Element {
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

export function useContextProps<T, U, E extends Element>(props: T, ref: React.ForwardedRef<E>, context: React.Context<WithRef<U, E>>): [T, React.RefObject<E>] {
  let {ref: contextRef, ...contextProps} = useContext(context) || {};
  let mergedRef = useObjectRef(mergeRefs(ref, contextRef));
  let mergedProps = mergeProps(contextProps, props) as unknown as T;
  return [mergedProps, mergedRef];
}
