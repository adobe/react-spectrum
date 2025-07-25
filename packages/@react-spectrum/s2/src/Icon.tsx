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

import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {ComponentType, Context, createContext, FunctionComponent, ReactNode, SVGProps, useRef} from 'react';
import {ContextValue, SlotProps} from 'react-aria-components';
import {mergeStyles} from '../style/runtime';
import {SkeletonWrapper, useSkeletonIcon} from './Skeleton';
import {style} from '../style' with {type: 'macro'};
import {StyleString} from '../style/types';
import {UnsafeStyles} from './style-utils' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';

// Custom list of overrides, excluding width/height/flexGrow/flexShrink/flexBasis
const allowedOverrides = [
  'margin',
  'marginStart',
  'marginEnd',
  'marginTop',
  'marginBottom',
  'marginX',
  'marginY',
  'justifySelf',
  'alignSelf',
  'order',
  'gridArea',
  'gridRowStart',
  'gridRowEnd',
  'gridColumnStart',
  'gridColumnEnd',
  'position',
  'zIndex',
  'top',
  'bottom',
  'inset',
  'insetX',
  'insetY',
  'insetStart',
  'insetEnd',
  'rotate',
  '--iconPrimary',
  'size'
] as const;

// Omit --iconPrimary and size from type (they are private).
// Use the iconStyle() macro to apply them.
type AllowedOverrides = Exclude<(typeof allowedOverrides)[number], '--iconPrimary' | 'size'>;

export interface IconProps extends UnsafeStyles, SlotProps, AriaLabelingProps, DOMProps {
  'aria-hidden'?: boolean | 'false' | 'true',
  styles?: StyleString<AllowedOverrides>
}

export interface IconContextValue extends UnsafeStyles, SlotProps {
  styles?: StyleString,
  render?: (icon: ReactNode) => ReactNode
}

export interface IllustrationProps extends UnsafeStyles, SlotProps, AriaLabelingProps, DOMProps {
  'aria-hidden'?: boolean | 'false' | 'true',
  size?: 'S' | 'M' | 'L',
  styles?: StyleString<AllowedOverrides>
}

export interface IllustrationContextValue extends IconContextValue {
  size?: 'S' | 'M' | 'L'
}

export const IconContext = createContext<ContextValue<Partial<IconContextValue>, SVGElement>>({});
export const IllustrationContext = createContext<ContextValue<Partial<IllustrationContextValue>, SVGElement>>({});

const iconStyles = style({
  size: 20,
  flexShrink: 0
}, allowedOverrides);

export function createIcon(Component: ComponentType<SVGProps<SVGSVGElement>>, context: Context<ContextValue<IconContextValue, SVGElement>> = IconContext): FunctionComponent<IconProps> {
  return (props: IconProps) => {
    let ref = useRef<SVGElement>(null);
    let ctx;
    // TODO: remove this default once we release RAC and use DEFAULT_SLOT.
    [ctx, ref] = useSpectrumContextProps({slot: props.slot || 'icon'} as IconContextValue, ref, context);
    let {render, styles: ctxStyles} = ctx;
    let {
      UNSAFE_className,
      UNSAFE_style,
      slot,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
      styles,
      ...otherProps
    } = props;

    if (!ariaHidden) {
      ariaHidden = undefined;
    }

    let svg = (
      <SkeletonWrapper>
        <Component
          {...otherProps}
          focusable={false}
          aria-label={ariaLabel}
          aria-hidden={ariaLabel ? (ariaHidden || undefined) : true}
          role="img"
          data-slot={slot}
          className={(UNSAFE_className ?? '') + ' ' + useSkeletonIcon(mergeStyles(iconStyles(null, styles), ctxStyles))}
          style={UNSAFE_style} />
      </SkeletonWrapper>
    );

    if (render) {
      return render(svg);
    }

    return svg;
  };
}

const illustrationStyles = style({
  size: {
    size: {
      S: 48,
      M: 96,
      L: 160
    }
  },
  flexShrink: 0
}, allowedOverrides);

export function createIllustration(Component: ComponentType<SVGProps<SVGSVGElement>>): FunctionComponent<IllustrationProps> {
  return (props: IllustrationProps) => {
    let ref = useRef<SVGElement>(null);
    let ctx;
    [ctx, ref] = useSpectrumContextProps({slot: props.slot || 'icon'} as IconContextValue, ref, IllustrationContext);
    let {styles: ctxStyles} = ctx;
    let {
      UNSAFE_className,
      UNSAFE_style,
      slot,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
      size = ctx.size || 'M',
      styles,
      // @ts-ignore
      render,
      ...otherProps
    } = props;

    if (!ariaHidden) {
      ariaHidden = undefined;
    }

    let svg = (
      <Component
        {...otherProps}
        // @ts-ignore
        size={size}
        focusable={false}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? (ariaHidden || undefined) : true}
        role="img"
        data-slot={slot}
        className={(UNSAFE_className ?? '') + ' ' + illustrationStyles({size}, styles) + (ctxStyles || '')}
        style={UNSAFE_style} />
    );

    if (render) {
      return render(svg);
    }

    return svg;
  };
}
