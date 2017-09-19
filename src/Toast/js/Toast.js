import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default function Toast({
  variant,
  children,
  closable,
  onClose
}) {
  return (
    <div className={classNames('spectrum-Toast', {['spectrum-Toast--' + variant]: variant})}>
      <div className="spectrum-Toast-typeIcon" role="img" aria-label={variant} />
      <div className="spectrum-Toast-content">{children}</div>
      {closable &&
        <button className="spectrum-Toast-closeButton" onClick={onClose} />
      }
    </div>
  );
}
