/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Context, ForwardedRef, useMemo} from 'react';
import {ContextValue, SlotProps, useSlottedContext} from 'react-aria-components';
import {mergeProps, useObjectRef} from 'react-aria';
import {mergeRefs} from '@react-aria/utils';
import {mergeStyles} from '../style/runtime';
import {RefObject} from '@react-types/shared';

export function useSpectrumContextProps<T, U extends SlotProps, E>(props: T & SlotProps, ref: ForwardedRef<E>, context: Context<ContextValue<U, E>>): [T, RefObject<E | null>] {
  let ctx = useSlottedContext(context, props.slot) || {};
  let {ref: contextRef, ...contextProps} = ctx as any;
  let mergedRef = useObjectRef(useMemo(() => mergeRefs(ref, contextRef), [ref, contextRef]));
  let mergedProps = mergeProps(contextProps, props) as unknown as T;

  // mergeProps does not merge `UNSAFE_style`
  if (
    'UNSAFE_style' in contextProps &&
    contextProps.UNSAFE_style &&
    'UNSAFE_style' in props &&
    props.UNSAFE_style
  ) {
    // @ts-ignore
    mergedProps.UNSAFE_style = {...contextProps.UNSAFE_style, ...props.UNSAFE_style};
  }

  // Merge macro styles.
  if ('styles' in contextProps && contextProps.styles && 'styles' in props && props.styles) {
    // @ts-ignore
    mergedProps.styles = mergeStyles(contextProps.styles, props.styles);
  }

  return [mergedProps, mergedRef];
}
