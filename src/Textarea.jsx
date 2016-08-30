import React from 'react';
import classNames from 'classnames';

export default function Textarea({
  className,
  quiet,
  disabled = false,
  required = false,
  invalid = false,
  readOnly = false,
  ...otherProps
}) {
  return (
    <textarea
      className={
        classNames(
          'coral-Textfield',
          'coral-Textfield--multiline',
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
      readOnly={ readOnly }
      { ...otherProps }
    />
  );
}

Textarea.displayName = 'Textarea';
