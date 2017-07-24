import classNames from 'classnames';
import React from 'react';

export default function DialogContent({
  className,
  children,
  ...otherProps
}) {
  // We don't need these props and using them causes unknown props warnings in React.
  delete otherProps.variant;
  delete otherProps.closable;
  delete otherProps.onClose;

  return (
    <div className={classNames('spectrum-Dialog-content', className)} {...otherProps}>
      {children}
    </div>
  );
}

DialogContent.displayName = 'DialogContent';
