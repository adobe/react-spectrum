import React from 'react';
import classNames from 'classnames';

const sizeMap = {
  L: 'large',
  M: 'medium',
  S: 'small'
};

export default ({
  size = 'L', // L, M, S
  children,
  color = 'grey',
  className,
  multiline,
  quiet,
  closable,
  disabled,
  value,
  onClose = () => {},
  ...otherProps
}) => (
  <div
    className={
      classNames(
        'coral-Tag',
        `coral-Tag--${ sizeMap[size] }`,
        `coral-Tag--${ color }`,
        {
          'coral-Tag--multiline': multiline,
          'coral-Tag--quiet': quiet
        },
        className
      )
    }
    { ...otherProps }
  >
    { closable ?
      <span
        className="coral-Button coral-Button--minimal coral-Button--square coral-Tag-removeButton"
        onClick={ disabled ? undefined : onClose.bind(this, value || children) }
      >
        <span className="coral-Icon coral-Icon--close coral-Icon--sizeXS" />
      </span>
    : null }
    <span className="coral-Tag-label">
      { children || value }
    </span>
  </div>
);
