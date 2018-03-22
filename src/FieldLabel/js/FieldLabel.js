import classNames from 'classnames';
import createId from '../../utils/createId';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

export default function FieldLabel({label, position, children, className, labelFor, ...otherProps}) {
  // There are 3 cases:
  // 1. No children - only render the <label>, no wrapping div. `labelFor` required.
  // 2. 1 child - render wrapping <div>. Automatically generate child `id` and label `for` attributes.
  // 3. > 1 children - render wrapping <div>. `labelFor` required, along with `id` on child.
  let childArray = React.Children.toArray(children);
  let id;
  if (childArray.length === 1) {
    // Use the existing id prop, or generate one.
    id = childArray[0].props.id || createId();
    childArray[0] = React.cloneElement(childArray[0], {id});
  }

  if (id && !labelFor) {
    labelFor = id;
  }

  if (!labelFor) {
    console.warn(`Missing labelFor attribute on FieldLabel with label "${label}"`);
  }

  let fieldLabel = (
    <label
      className={classNames(
        'spectrum-FieldLabel',
        {
          'spectrum-FieldLabel--left': position === 'left'
        },
        childArray.length === 0 ? className : null
      )}
      htmlFor={labelFor}
      {...otherProps}>
      {label}
    </label>
  );

  if (childArray.length > 0) {
    return (
      <div className={className}>
        {fieldLabel}
        {childArray}
      </div>
    );
  }

  return fieldLabel;
}

FieldLabel.displayName = 'FieldLabel';

FieldLabel.propTypes = {
  label: PropTypes.string.isRequired,
  position: PropTypes.string,
  className: PropTypes.string,
  labelFor: PropTypes.string
};
