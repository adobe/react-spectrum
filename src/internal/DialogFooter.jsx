import React from 'react';
import Button from '../Button';
import classNames from 'classnames';

function addClose(children, onClose) {
  return React.Children.map(children, child => {
    if (React.isValidElement(child) && child.props && child.props['close-dialog']) {
      // String has no Prop

      return React.cloneElement(child, {
        children: addClose(child.props.children),
        onClick: (...args) => {
          if (child.props.onClick) {
            child.props.onClick.apply(child, args);
          }
          onClose.apply(child, args);
        }
      });
    }
    return child;
  });
}

export default function DialogFooter({
  children,
  onClose,
  className,
  ...otherProps
}) {
  return (
    <div className={ classNames('coral-Dialog-footer', className) } { ...otherProps }>
      {
        children ?
          addClose(children, onClose) :
          <Button variant="primary" label="OK" onClick={ onClose } />
      }
    </div>
  );
}
