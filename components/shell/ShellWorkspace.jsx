import React from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

import './ShellWorkspaces.styl';

export default ({
  href = '#',
  title,
  selected = false,
  className,
  children,
  ...otherProps
}) => (
  <a
    className={
      classNames(
        'coral-Shell-workspaces-workspace',
        { 'is-selected': selected },
        className
      )
    }
    href={ href }
    selected={ selected }
    { ...otherProps }
  >
    { children }
  </a>
)
