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
import {
  classNames,
SlotProvider,
useDOMRef,
useStyleProps
} from '@react-spectrum/utils';
import {
  DOMRef
} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SpectrumSearchWithinProps} from '@react-types/searchfield';
import styles from '@adobe/spectrum-css-temp/components/searchwithin/index.css';
import {useProviderProps} from '@react-spectrum/provider';

function SearchWithin(props: SpectrumSearchWithinProps, ref: DOMRef) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);

  let domRef = useDOMRef(ref);

  return (
    <Field {...props} labelProps={{}} ref={domRef}>
      <SearchWithinBase
        className={styleProps.className}
        style={styleProps.style}
        {...props} />
    </Field>
  );
}

interface SearchWithinBaseProps extends SpectrumSearchWithinProps{
  className?: string,
  style?: React.CSSProperties
}

const SearchWithinBase = React.forwardRef(function SearchWithinBase(
  props: SearchWithinBaseProps) {
  let {className} = props;

  return (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}>
      <div className={classNames(styles, 'spectrum-SearchWithin', className)}>
        <SlotProvider
          slots={{
            searchfield: {
              UNSAFE_className: classNames(styles, 'spectrum-Textfield')
            },
            picker: {
              placeholder: null,
              UNSAFE_className: classNames(styles, 'spectrum-Dropdown'),
              align: 'end',
              menuWidth: 'size-6000'
            }
          }}>
          {props.children}
        </SlotProvider>
      </div>
    </FocusRing>
  );
});

const _SearchWithin = React.forwardRef(SearchWithin);
export {_SearchWithin as SearchWithin};
