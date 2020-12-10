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

import React from "react";
import styles from "@adobe/spectrum-css-temp/components/searchwithin/vars.css";
import {
  classNames,
  useDOMRef,
  SlotProvider,
  useStyleProps,
  dimensionValue,
} from "@react-spectrum/utils";

import {
  DOMRef,
  DOMRefValue,
  FocusableRefValue,
  LabelPosition,
} from "@react-types/shared";
import { SpectrumSearchWithinProps } from "@react-types/searchfield";

import { useProviderProps } from "@react-spectrum/provider";

function SearchWithin(props: SpectrumSearchWithinProps, ref: DOMRef) {
  props = useProviderProps(props);
  let { styleProps } = useStyleProps(props);
  let {
    isQuiet,
    isDisabled,
    isRequired,
    label,
    children,
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);

  let pickerStyle = {
    width: dimensionValue(100),
  };

  return (
    <div
      className={classNames(
        styles,
        "spectrum-SearchWithin",
        styleProps.className
      )}
    >
      <SlotProvider
        slots={{
          searchfield: {
            UNSAFE_className: classNames(styles, "spectrum-SearchWithin-input"),
          },
          picker: {
            placeholder: null,
            UNSAFE_style: pickerStyle,
            UNSAFE_className: classNames(
              styles,
              "spectrum-SearchWithin-picker"
            ),
            align: "end",
            menuWidth: "size-6000",
          },
        }}
      >
        {props.children}
      </SlotProvider>
    </div>
  );
}

const _SearchWithin = React.forwardRef(SearchWithin);
export { _SearchWithin as SearchWithin };
