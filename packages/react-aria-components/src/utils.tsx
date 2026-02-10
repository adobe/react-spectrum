/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, RefObject,  DOMProps as SharedDOMProps} from '@react-types/shared';
import {mergeProps, mergeRefs, useLayoutEffect, useObjectRef} from '@react-aria/utils';
import React, {AllHTMLAttributes, AnchorHTMLAttributes, Context, CSSProperties, DetailedHTMLProps, ForwardedRef, forwardRef, JSX, ReactElement, ReactNode, RefCallback, useCallback, useContext, useMemo, useRef, useState} from 'react';

export const DEFAULT_SLOT = Symbol('default');

interface SlottedValue<T> {
  slots?: Record<string | symbol, T>
}

export type SlottedContextValue<T> = SlottedValue<T> | T | null | undefined;
export type ContextValue<T, E> = SlottedContextValue<WithRef<T, E>>;

type ProviderValue<T> = [Context<T>, T];
type ProviderValues<A, B, C, D, E, F, G, H, I, J, K> =
  | [ProviderValue<A>]
  | [ProviderValue<A>, ProviderValue<B>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>, ProviderValue<G>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>, ProviderValue<G>, ProviderValue<H>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>, ProviderValue<G>, ProviderValue<H>, ProviderValue<I>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>, ProviderValue<G>, ProviderValue<H>, ProviderValue<I>, ProviderValue<J>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>, ProviderValue<F>, ProviderValue<G>, ProviderValue<H>, ProviderValue<I>, ProviderValue<J>, ProviderValue<K>];

interface ProviderProps<A, B, C, D, E, F, G, H, I, J, K> {
  values: ProviderValues<A, B, C, D, E, F, G, H, I, J, K>,
  children: ReactNode
}

export function Provider<A, B, C, D, E, F, G, H, I, J, K>({values, children}: ProviderProps<A, B, C, D, E, F, G, H, I, J, K>): JSX.Element {
  for (let [Context, value] of values) {
    // @ts-ignore
    children = <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return children as JSX.Element;
}

export interface StyleProps {
  /** The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. */
  className?: string,
  /** The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. */
  style?: CSSProperties
}

export interface DOMProps extends StyleProps, SharedDOMProps {
  /** The children of the component. */
  children?: ReactNode
}

export type ClassNameOrFunction<T> = string | ((values: T & {defaultClassName: string | undefined}) => string);
type StyleOrFunction<T> = CSSProperties | ((values: T & {defaultStyle: CSSProperties}) => CSSProperties | undefined);

export interface StyleRenderProps<T, E extends keyof React.JSX.IntrinsicElements = 'div'> extends DOMRenderProps<E, T> {
  /** The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. */
  className?: ClassNameOrFunction<T>,
  /** The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. */
  style?: StyleOrFunction<T>
}

export type ChildrenOrFunction<T> = ReactNode | ((values: T & {defaultChildren: ReactNode | undefined}) => ReactNode);

export interface RenderProps<T, E extends keyof React.JSX.IntrinsicElements = 'div'> extends StyleRenderProps<T, E> {
  /** The children of the component. A function may be provided to alter the children based on component state. */
  children?: ChildrenOrFunction<T>
}

interface RenderPropsHookOptions<T, E extends keyof React.JSX.IntrinsicElements> extends RenderProps<T, E>, SharedDOMProps, AriaLabelingProps {
  values: T,
  defaultChildren?: ReactNode,
  defaultClassName?: string,
  defaultStyle?: CSSProperties
}

interface RenderPropsHookRetVal<T, E extends keyof React.JSX.IntrinsicElements> {
  className?: string,
  style?: CSSProperties,
  children?: ReactNode,
  'data-rac': string,
  render?: DOMRenderFunction<E, T>
}

export function useRenderProps<T, E extends keyof React.JSX.IntrinsicElements>(props: RenderPropsHookOptions<T, E>): RenderPropsHookRetVal<T, E> {
  let {
    className,
    style,
    children,
    defaultClassName = undefined,
    defaultChildren = undefined,
    defaultStyle,
    values,
    render
  } = props;

  return useMemo(() => {
    let computedClassName: string | undefined;
    let computedStyle: React.CSSProperties | undefined;
    let computedChildren: React.ReactNode | undefined;

    if (typeof className === 'function') {
      computedClassName = className({...values, defaultClassName});
    } else {
      computedClassName = className;
    }

    if (typeof style === 'function') {
      computedStyle = style({...values, defaultStyle: defaultStyle || {}});
    } else {
      computedStyle = style;
    }

    if (typeof children === 'function') {
      computedChildren = children({...values, defaultChildren});
    } else if (children == null) {
      computedChildren = defaultChildren;
    } else {
      computedChildren = children;
    }

    return {
      className: computedClassName ?? defaultClassName,
      style: (computedStyle || defaultStyle) ? {...defaultStyle, ...computedStyle} : undefined,
      children: computedChildren ?? defaultChildren,
      'data-rac': '',
      render: render ? (props => render(props, values)) : undefined
    };
  }, [className, style, children, defaultClassName, defaultChildren, defaultStyle, values, render]);
}

/**
 * A helper function that accepts a user-provided render prop value (either a static value or a function),
 * and combines it with another value to create a final result.
 */
export function composeRenderProps<T, U, V extends T>(
  // https://stackoverflow.com/questions/60898079/typescript-type-t-or-function-t-usage
  value: T extends any ? (T | ((renderProps: U) => V)) : never,
  wrap: (prevValue: T, renderProps: U) => V
): (renderProps: U) => V {
  return (renderProps) => wrap(typeof value === 'function' ? value(renderProps) : value, renderProps);
}

export type WithRef<T, E> = T & {ref?: ForwardedRef<E>};
export interface SlotProps {
  /**
   * A slot name for the component. Slots allow the component to receive props from a parent component.
   * An explicit `null` value indicates that the local props completely override all props received from a parent.
   */
  slot?: string | null
}

export function useSlottedContext<T>(context: Context<SlottedContextValue<T>>, slot?: string | null): T | null | undefined {
  let ctx = useContext(context);
  if (slot === null) {
    // An explicit `null` slot means don't use context.
    return null;
  }
  if (ctx && typeof ctx === 'object' && 'slots' in ctx && ctx.slots) {
    let slotKey = slot || DEFAULT_SLOT;
    if (!ctx.slots[slotKey]) {
      let availableSlots = new Intl.ListFormat().format(Object.keys(ctx.slots).map(p => `"${p}"`));
      let errorMessage = slot ? `Invalid slot "${slot}".` : 'A slot prop is required.';

      throw new Error(`${errorMessage} Valid slot names are ${availableSlots}.`);
    }
    return ctx.slots[slotKey];
  }
  // @ts-ignore
  return ctx;
}

export function useContextProps<T, U extends SlotProps, E extends Element>(props: T & SlotProps, ref: ForwardedRef<E> | undefined, context: Context<ContextValue<U, E>>): [T, RefObject<E | null>] {
  let ctx = useSlottedContext(context, props.slot) || {};
  let {ref: contextRef, ...contextProps} = ctx as any;
  let mergedRef = useObjectRef(useMemo(() => mergeRefs(ref, contextRef), [ref, contextRef]));
  let mergedProps = mergeProps(contextProps, props) as unknown as T;

  // mergeProps does not merge `style`. Adding this there might be a breaking change.
  if (
    'style' in contextProps &&
    contextProps.style &&
    'style' in props &&
    props.style
  ) {
    if (typeof contextProps.style === 'function' || typeof props.style === 'function') {
      // @ts-ignore
      mergedProps.style = (renderProps) => {
        let contextStyle = typeof contextProps.style === 'function' ? contextProps.style(renderProps) : contextProps.style;
        let defaultStyle = {...renderProps.defaultStyle, ...contextStyle};
        let style = typeof props.style === 'function'
          ? props.style({...renderProps, defaultStyle})
          : props.style;
        return {...defaultStyle, ...style};
      };
    } else {
      // @ts-ignore
      mergedProps.style = {...contextProps.style, ...props.style};
    }
  }

  return [mergedProps, mergedRef];
}

export function useSlot(initialState: boolean | (() => boolean) = true): [RefCallback<Element>, boolean] {
  // Initial state is typically based on the parent having an aria-label or aria-labelledby.
  // If it does, this value should be false so that we don't update the state and cause a rerender when we go through the layoutEffect
  let [hasSlot, setHasSlot] = useState(initialState);
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

/**
 * Filters out `data-*` attributes to keep them from being passed down and duplicated.
 * @param props
 */
export function removeDataAttributes<T>(props: T): T {
  const prefix = /^(data-.*)$/;
  let filteredProps = {} as T;

  for (const prop in props) {
    if (!prefix.test(prop)) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps;
}

// Override base type to change the default.
export interface RACValidation {
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when the value is missing or invalid, or mark the field as required
   * or invalid via ARIA.
   * @default 'native'
   */
  validationBehavior?: 'native' | 'aria'
}

export type DOMRenderFunction<E extends keyof React.JSX.IntrinsicElements, T> = (props: React.JSX.IntrinsicElements[E], renderProps: T) => ReactElement;
export interface DOMRenderProps<E extends keyof React.JSX.IntrinsicElements, T> {
  /**
   * Overrides the default DOM element with a custom render function.
   * This allows rendering existing components with built-in styles and behaviors
   * such as router links, animation libraries, and pre-styled components.
   * 
   * Requirements:
   * 
   * * You must render the expected element type (e.g. if `<button>` is expected, you cannot render an `<a>`).
   * * Only a single root DOM element can be rendered (no fragments).
   * * You must pass through props and ref to the underlying DOM element, merging with your own prop as appropriate.
   */
  render?: DOMRenderFunction<E, T>
}

// Makes `href` required in AnchorHTMLAttributes
type LinkWithRequiredHref = Required<Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>; 

// Same as DOMRenderProps but specific for the case where the element could be a 'a' or 'div' element.
export interface PossibleLinkDOMRenderProps<Fallback extends keyof React.JSX.IntrinsicElements, T> {
  /**
   * Overrides the default DOM element with a custom render function.
   * This allows rendering existing components with built-in styles and behaviors
   * such as router links, animation libraries, and pre-styled components.
   * 
   * Note: You can check if `'href' in props` in order to tell whether to render an `<a>` element.
   * 
   * Requirements:
   * 
   * * You must render the expected element type (e.g. if `<a>` is expected, you cannot render a `<button>`).
   * * Only a single root DOM element can be rendered (no fragments).
   * * You must pass through props and ref to the underlying DOM element, merging with your own prop as appropriate.
   */
  render?: (props: DetailedHTMLProps<LinkWithRequiredHref, HTMLAnchorElement> | React.JSX.IntrinsicElements[Fallback], renderProps: T) => ReactElement
}

function DOMElement(ElementType: string, props: DOMRenderProps<any, any> & AllHTMLAttributes<HTMLElement>, forwardedRef: ForwardedRef<HTMLElement>) {
  let {render, ...otherProps} = props;
  let elementRef = useRef<HTMLElement | null>(null);
  let ref = useMemo(() => mergeRefs(forwardedRef, elementRef), [forwardedRef, elementRef]);

  useLayoutEffect(() => {
    if (process.env.NODE_ENV !== 'production' && render) {
      if (!elementRef.current) {
        console.warn('Ref was not connected to DOM element returned by custom `render` function. Did you forget to pass through or merge the `ref`?');
      } else if (elementRef.current.localName !== ElementType) {
        console.warn(`Unexpected DOM element returned by custom \`render\` function. Expected <${ElementType}>, got <${elementRef.current.localName}>. This may break the component behavior and accessibility.`);
      }
    }
  }, [ElementType, render]);

  let domProps: any = {...otherProps, ref};
  if (render) {
    return render(domProps, undefined);
  }

  return <ElementType {...domProps} />;
}

type DOMComponents = {
  [E in keyof React.JSX.IntrinsicElements]: (props: DOMRenderProps<E, any> & React.JSX.IntrinsicElements[E]) => ReactElement
};

const domComponentCache = {};

// Dynamically generates and caches components for each DOM element (e.g. `dom.button`).
export const dom = new Proxy({}, {
  get(target, elementType) {
    if (typeof elementType !== 'string') {
      return undefined;
    }

    let res = domComponentCache[elementType];
    if (!res) {
      res = forwardRef(DOMElement.bind(null, elementType));
      domComponentCache[elementType] = res;
    }

    return res;
  }
}) as DOMComponents;
