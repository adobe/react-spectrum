import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default function InputGroup({quiet, focused, invalid, disabled, className, children, ...otherProps}) {
  return (
    <div
      aria-disabled={disabled}
      aria-invalid={invalid}
      className={
        classNames(
          'spectrum-InputGroup',
          {
            'spectrum-InputGroup--quiet': quiet,
            'is-focused': focused,
            'is-invalid': invalid,
            'is-disabled': disabled
          },
          className
        )
      }
      {...otherProps}>
      {children}
    </div>
  );
}
