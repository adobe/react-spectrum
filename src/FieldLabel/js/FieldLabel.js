import Asterisk from '../../Icon/Asterisk';
import classNames from 'classnames';
import intlMessages from '../intl/*.json';
import LabelBase from './LabelBase';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('fieldlabel');
let formatMessage = messageFormatter(intlMessages);

export default function FieldLabel({label, position, children, className, labelFor, necessity, necessityIndicator, ...otherProps}) {
  let necessityMap = {
    required: `${label} ${formatMessage('(required)')}`,
    optional: `${label} ${formatMessage('(optional)')}`
  };
  let icon = null;
  if (necessityIndicator === 'icon' && necessity === 'required') {
    icon = <Asterisk className="spectrum-UIIcon-Asterisk spectrum-fieldLabel-requiredIcon" size="S" alt={formatMessage('(required)')} />;
  }

  return (
    <LabelBase
      label={necessity && necessityIndicator === 'label' ? necessityMap[necessity] : label}
      className={className}
      componentName="FieldLabel"
      labelClassName={classNames(
        'spectrum-FieldLabel',
        {
          'spectrum-FieldLabel--left': position === 'left',
          'spectrum-FieldLabel--right': position === 'right'
        }
      )}
      labelFor={labelFor}
      icon={icon}
      {...otherProps}>
      {children}
    </LabelBase>
  );
}

FieldLabel.displayName = 'FieldLabel';

FieldLabel.propTypes = {
  /**
   * String to display
   */
  label: PropTypes.string.isRequired,

  /**
   * Justification of the label text within its container. Setting this property
   * will situate the label container to the left of the form field, regardless
   * of the property value.
   */
  position: PropTypes.oneOf(['left', 'right']),

  /**
   * Custom classname to apply to the label
   */
  className: PropTypes.string,

  /**
   * Like in a form, with what input should the label be associated
   */
  labelFor: PropTypes.string,
  
  /**
   * Style for communicating whether the associated input is required or optional.
   */
  necessity: PropTypes.oneOf(['required', 'optional']),

  /**
   * 'icon' adds an asterix to the field label if necessity is required.
   * 'label' adds a '(required)' or '(optional)' string to the label depending on the necessity.
   */
  necessityIndicator: PropTypes.oneOf(['icon', 'label'])
};

FieldLabel.defaultProps = {
  necessityIndicator: 'icon'
};
