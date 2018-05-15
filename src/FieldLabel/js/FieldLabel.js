import classNames from 'classnames';
import LabelBase from './LabelBase';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('fieldlabel');

export default function FieldLabel({label, position, children, className, labelFor, ...otherProps}) {
  return (
    <LabelBase
      label={label}
      className={className}
      componentName="FieldLabel"
      labelClassName={classNames(
        'spectrum-FieldLabel',
        {
          'spectrum-FieldLabel--left': position === 'left'
        }
      )}
      labelFor={labelFor}
      {...otherProps}>
      {children}
    </LabelBase>
  );
}

FieldLabel.displayName = 'FieldLabel';

FieldLabel.propTypes = {
  label: PropTypes.string.isRequired,
  position: PropTypes.string,
  className: PropTypes.string,
  labelFor: PropTypes.string
};
