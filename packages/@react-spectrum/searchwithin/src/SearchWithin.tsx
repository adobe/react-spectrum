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
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {useCallback, useRef, useState} from 'react';
import {SpectrumSearchWithinProps} from '@react-types/searchwithin';
import styles from '@adobe/spectrum-css-temp/components/searchwithin/vars.css';
import {useFormProps} from '@react-spectrum/form';
import {useId, useLayoutEffect} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import {VisuallyHidden} from '@react-aria/visually-hidden';

/**
 * A SearchWithin combines a SearchField and a Picker into a single group. This allows a user to constrain the scope of their search to a particular category, for example.
 */
export const SearchWithin = React.forwardRef(function SearchWithin(props: SpectrumSearchWithinProps, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/searchwithin');
  let {styleProps} = useStyleProps(props);
  let {
    children,
    isDisabled,
    isRequired,
    label
  } = props;

  let defaultAriaLabel = stringFormatter.format('search');
  if (!label && !props['aria-label'] && !props['aria-labelledby']) {
    props['aria-label'] = defaultAriaLabel;
  }
  // Get label and group props (aka fieldProps)
  let {labelProps, fieldProps} = useLabel(props);

  // Grab aria-labelledby for the search input. Will need the entire concatenated aria-labelledby if it exists since pointing at the group id doesn’t
  // suffice if there is a external label
  let labelledBy = fieldProps['aria-labelledby'] || (fieldProps['aria-label'] !== defaultAriaLabel ? fieldProps.id : '');
  let pickerId = useId();

  let domRef = useFocusableRef(ref);
  let groupRef = useRef<HTMLDivElement>(null);

  // Measure the width of the field to inform the width of the menu.
  let [menuWidth, setMenuWidth] = useState<number | null>(null);
  let {scale} = useProvider();

  let onResize = useCallback(() => {
    let shouldUseGroup = !!label;
    let width = shouldUseGroup ? groupRef.current?.offsetWidth : domRef.current?.offsetWidth;

    if (width && !isNaN(width)) {
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
    validationState: null,
    description: null,
    errorMessage: null,
    descriptionProps: null,
    errorMessageProps: null,
    'aria-label': null
  };

  let searchFieldClassName = classNames(styles, 'spectrum-SearchWithin-searchfield');
  let pickerClassName = classNames(styles, 'spectrum-SearchWithin-picker');
  let visuallyHiddenId = useId();

  let slots = {
    searchfield: {
      ...defaultSlotValues,
      UNSAFE_className: searchFieldClassName,
      // Apply aria-labelledby of group or the group id to searchfield. No need to pass the group id (we want a new one) and aria-label (aria-labelledby will suffice)
      'aria-labelledby': `${labelledBy} ${visuallyHiddenId} ${pickerId}`,
      // When label is provided, input should have id referenced by htmlFor of label, instead of group
      id: label && fieldProps.id
    },
    picker: {
      ...defaultSlotValues,
      id: pickerId,
      UNSAFE_className: pickerClassName,
      menuWidth,
      align: 'end',
      'aria-labelledby': `${labelledBy} ${visuallyHiddenId}`
    }
  };

  if (label) {
    // When label is provided, input should have id referenced by htmlFor of label, instead of group
    delete fieldProps.id;
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
        {...fieldProps}
        role="group"
        className={classNames(styles, 'spectrum-SearchWithin', styleProps.className)}
        ref={groupRef}>
        <VisuallyHidden id={visuallyHiddenId}>{stringFormatter.format('searchWithin')}</VisuallyHidden>
        <SlotProvider slots={slots}>
          {children}
        </SlotProvider>
      </div>
    </Field>
  );
});
