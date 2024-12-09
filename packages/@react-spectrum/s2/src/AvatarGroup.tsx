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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {AvatarContext} from './Avatar';
import {ContextValue, SlotProps} from 'react-aria-components';
import {createContext, CSSProperties, forwardRef, ReactNode} from 'react';
import {filterDOMProps} from '@react-aria/utils';
import {getAllowedOverrides, StylesPropWithoutWidth, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLabel} from 'react-aria';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface AvatarGroupProps extends UnsafeStyles, DOMProps, AriaLabelingProps, SlotProps {
  /** Avatar children of the avatar group. */
  children: ReactNode,
  /** The label for the avatar group. */
  label?: string,
  /**
   * The size of the avatar group.
   * @default 24
   */
  size?: 16 | 20 | 24 | 28 | 32 | 36 | 40,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithoutWidth
}

export const AvatarGroupContext = createContext<ContextValue<AvatarGroupProps, DOMRefValue<HTMLDivElement>>>(null);

const avatar = style({
  marginStart: {
    default: '[calc(var(--size) / -4)]',
    ':first-child': 0
  }
});

const text = style({
  marginStart: 8,
  truncate: true,
  font: {
    size: {
      16: 'ui-xs',
      20: 'ui-sm',
      24: 'ui',
      28: 'ui-lg',
      32: 'ui-xl',
      36: 'ui-2xl',
      40: 'ui-3xl'
    }
  }
});

const container = style({
  display: 'flex',
  alignItems: 'center'
}, getAllowedOverrides({width: false}));

/**
 * An avatar group is a grouping of avatars that are related to each other.
 */
export const AvatarGroup = forwardRef(function AvatarGroup(props: AvatarGroupProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AvatarGroupContext);
  let domRef = useDOMRef(ref);
  let {children, label, size = 24, styles, UNSAFE_style, UNSAFE_className, ...otherProps} = props;
  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  return (
    <AvatarContext.Provider value={{styles: avatar, size, isOverBackground: true}}>
      <div
        ref={domRef}
        {...filterDOMProps(otherProps)}
        {...fieldProps}
        role="group"
        className={(UNSAFE_className ?? '') + container(null, styles)}
        style={{
          ...UNSAFE_style,
          '--size': size / 16 + 'rem'
        } as CSSProperties}>
        {children}
        {label && <span {...labelProps} className={text({size: String(size)})}>{label}</span>}
      </div>
    </AvatarContext.Provider>
  );
});
