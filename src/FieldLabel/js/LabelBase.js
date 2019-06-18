/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

export default function LabelBase({
  label,
  children,
  className,
  labelClassName,
  wrapperClassName,
  labelFor,
  componentName,
  icon,
  ...otherProps
}) {
  // There are 3 cases:
  // 1. No children - only render the <label>, no wrapping div. `labelFor` required.
  // 2. 1 child - render wrapping <div>. Automatically generate child `id` and label `for` attributes.
  // 3. > 1 children - render wrapping <div>. `labelFor` required, along with `id` on child.
  let childArray = React.Children.toArray(children);
  let id;
  let labelId = otherProps.id || createId();
  delete otherProps.id;

  if (childArray.length === 1) {
    // Use the existing id prop, or generate one.
    id = childArray[0].props.id || createId();
    let ariaLabelledby = childArray[0].props['aria-labelledby'] || (label ? labelId : null);
    childArray[0] = React.cloneElement(
      childArray[0],
      {
        id,
        labelId,
        'aria-labelledby': ariaLabelledby
      }
    );
  }

  if (id && !labelFor) {
    labelFor = id;
  }

  if (!labelFor) {
    console.warn(`Missing labelFor attribute on ${componentName} with label "${label}"`);
  }

  let fieldLabelClassName = classNames(
    labelClassName,
    childArray.length === 0 ? className : null
  );

  let fieldLabel = label ? (
    <label
      className={fieldLabelClassName}
      id={labelId}
      htmlFor={labelFor}
      {...filterDOMProps(otherProps)}>
      {label}
      {icon && ' '}
      {icon && icon}
    </label>
  ) : (
    <div
      className={fieldLabelClassName}
      {...filterDOMProps(otherProps)} />
  );

  if (childArray.length > 0) {
    if (wrapperClassName) {
      childArray = (
        <div className={wrapperClassName}>
          {childArray}
        </div>
      );
    }

    return (
      <div className={className}>
        {fieldLabel}
        {childArray}
      </div>
    );
  }

  return fieldLabel;
}
