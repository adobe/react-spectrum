/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames, SlotProvider, useFocusableRef, useResizeObserver, useStyleProps} from '@react-spectrum/utils';
import {Field} from '@react-spectrum/label';
import {FocusableRef} from '@react-types/shared';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {SpectrumSearchWithinProps} from '@react-types/searchwithin';
import styles from '@adobe/spectrum-css-temp/components/searchwithin/vars.css';
import {useLabel} from '@react-aria/label';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

function SearchWithin(props: SpectrumSearchWithinProps, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let {labelProps, fieldProps} = useLabel(props);
  let {
    children,
    isDisabled,
    isRequired,
    label,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;

  let domRef = useFocusableRef(ref);
  let groupRef = useRef<HTMLDivElement>();

  // Measure the width of the field to inform the width of the menu.
  let [menuWidth, setMenuWidth] = useState(null);
  let {scale} = useProvider();

  let onResize = useCallback(() => {
    let shouldUseGroup = !!label;
    let width = shouldUseGroup ? groupRef.current?.offsetWidth : domRef.current?.offsetWidth;

    if (!isNaN(width)) {
      setMenuWidth(width);
    }
  }, [groupRef, domRef, setMenuWidth, label]);

  useResizeObserver({
    ref: domRef,
    onResize: onResize
  });

  useLayoutEffect(onResize, [scale, onResize]);

  let defaultSlotValues = {
    isDisabled,
    isRequired,
    label: null,
    isQuiet: false,
    'aria-labelledby': labelProps.id || ariaLabel,
    validationState: null
  };
  let searchFieldClassName = classNames(styles, 'spectrum-SearchWithin-searchfield');
  let pickerClassName = classNames(styles, 'spectrum-SearchWithin-picker');
  let slots = {
    searchfield: {UNSAFE_className: searchFieldClassName, ...fieldProps, ...defaultSlotValues},
    picker: {UNSAFE_className: pickerClassName, menuWidth, align: 'end', ...defaultSlotValues}
  };

  if (!label && !ariaLabel && !ariaLabelledby) {
    console.warn('If you do not provide a `label` prop, you must specify an aria-label or aria-labelledby attribute for accessibility');
  }

  return (
    <Field
      {...props}
      labelProps={labelProps}
      ref={domRef}
      wrapperClassName={classNames(
        styles,
        'spectrum-SearchWithin-container'
      )}>
      <div
        role="group"
        aria-labelledby={labelProps.id || ariaLabel}
        className={classNames(styles, 'spectrum-SearchWithin', styleProps.className)}
        ref={groupRef}>
        <SlotProvider slots={slots}>
          {children}
        </SlotProvider>
      </div>
    </Field>
  );
}

/**
 * A SearchWithin combines a SearchField and a Picker into a single group. This allows a user to constrain the scope of their search to a particular category, for example.
 */
const _SearchWithin = React.forwardRef(SearchWithin);
export {_SearchWithin as SearchWithin};
