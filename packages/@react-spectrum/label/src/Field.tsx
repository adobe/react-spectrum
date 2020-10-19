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

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {Label} from './Label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {SpectrumFieldProps} from '@react-types/label';

function Field(props: SpectrumFieldProps, ref: DOMRef<HTMLDivElement>) {
  let {
    label,
    labelPosition = 'top',
    labelAlign,
    isRequired,
    necessityIndicator,
    includeNecessityIndicatorInAccessibilityName,
    children,
    labelProps,
    elementType,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  if (label) {
    let labelWrapperClass = classNames(
      labelStyles,
      'spectrum-Field',
      {
        'spectrum-Field--positionTop': labelPosition === 'top',
        'spectrum-Field--positionSide': labelPosition === 'side'
      },
      styleProps.className
    );

    children = React.cloneElement(children, mergeProps(children.props, {
      className: classNames(labelStyles, 'spectrum-Field-field')
    }));

    return (
      <div
        {...styleProps}
        ref={domRef}
        className={labelWrapperClass}>
        <Label
          {...labelProps}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}
          includeNecessityIndicatorInAccessibilityName={includeNecessityIndicatorInAccessibilityName}
          elementType={elementType}>
          {label}
        </Label>
        {children}
      </div>
    );
  }

  return React.cloneElement(children, mergeProps(children.props, {
    ...styleProps,
    ref: domRef
  }));
}

let _Field = React.forwardRef(Field);
export {_Field as Field};
