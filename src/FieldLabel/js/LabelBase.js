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
    childArray[0] = React.cloneElement(childArray[0], {id, labelId});
  }

  if (id && !labelFor) {
    labelFor = id;
  }

  if (!labelFor) {
    console.warn(`Missing labelFor attribute on ${componentName} with label "${label}"`);
  }

  let fieldLabel = (
    <label
      className={classNames(
        labelClassName,
        childArray.length === 0 ? className : null
      )}
      id={labelId}
      htmlFor={labelFor}
      {...filterDOMProps(otherProps)}>
      {label}
    </label>
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
