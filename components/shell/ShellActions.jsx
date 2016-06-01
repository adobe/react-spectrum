import React from 'react';
import classNames from 'classnames';

import './ShellHeader.styl';

export default ({
  className,
  children,
  betaFeedback,
  ...otherProps
}) => (
  <div className={ classNames('coral-Shell-header-actions', className) }>
    { betaFeedback }
    <div className="coral-Shell-menubar">
      { children }
    </div>
  </div>
)
