import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  quiet,
  disabled = false,
  required = false,
  invalid = false,
  readOnly = false,
  ...otherProps
}) => {
  return (
    <input
      className={
        classNames(
          'coral-Textfield',
          {
            'is-invalid': invalid,
            'coral-Textfield--quiet': quiet
          },
          className
        )
      }
      aria-disabled={ disabled }
      aria-required={ required }
      aria-invalid={ invalid }
      aria-readonly={ readOnly }
      disabled={ disabled }
      required={ required }
      invalid={ invalid }
      readonly={ readOnly }
      { ...otherProps }
    />
  );
}
