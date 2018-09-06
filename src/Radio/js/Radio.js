import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import SwitchBase from '../../Switch/js/SwitchBase';

importSpectrumCSS('radio');

export default function Radio({
  className,
  labelBelow,
  quiet,
  ...otherProps
}) {
  return (
    <SwitchBase
      inputType="radio"
      className={
        classNames(
          'spectrum-Radio',
          {
            'spectrum-Radio--labelBelow': labelBelow,
            'spectrum-Radio--quiet': quiet
          },
          className
        )
      }
      inputClassName="spectrum-Radio-input"
      markClassName="spectrum-Radio-button"
      labelClassName="spectrum-Radio-label"
      {...otherProps} />
  );
}

Radio.displayName = 'Radio';
Radio.propTypes = {
  /**
  * Class given to radio
  */
  className: PropTypes.string,

  /**
  * Whether label is below radio
  */
  labelBelow: PropTypes.bool,

  /**
  * Whether switch is a quiet variation
  */
  quiet: PropTypes.bool
};
