import classNames from 'classnames';
import React from 'react';
import '../style/ShellHeader.styl';

export default function ShellHeader({
  homeURL = '#',
  homeIcon,
  homeTitle = 'Adobe Experience Manager',
  className,
  children,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral3-Shell-header',
          'coral--dark',
          className
        )
      }
      {...otherProps}>
      <div className="coral3-Shell-header-home" role="heading" aria-level="2">
        <a className="coral3-Shell-homeAnchor" href={homeURL}>
          {homeIcon}
          <div className="coral3-Shell-homeAnchor-label">{homeTitle}</div>
        </a>
      </div>
      {children}
    </div>
  );
}

ShellHeader.displayName = 'ShellHeader';
