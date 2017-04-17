import React from 'react';
import classNames from 'classnames';
import Button from '../../Button';

function addClose(children, onClose) {
  return React.Children.map(children, child => {
    // String has no Prop
    if (React.isValidElement(child) && child.props) {
      // Strip close-dialog off of the child since it isn't a valid property outside of
      // this context. This will prevent unknown prop warnings from being fired by react.
      const { 'close-dialog': shouldClose, children: kids, ...otherProps } = child.props;

      if (shouldClose) {
        otherProps.onClick = (...args) => {
          if (child.props.onClick) {
            child.props.onClick.apply(child, args);
          }
          onClose.apply(child, args);
        };
        return React.createElement(child.type, otherProps, addClose(kids, onClose));
      }
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
  // We don't need these props and using them causes unknown props warnings in React.
  delete otherProps.variant;
  delete otherProps.closable;

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

DialogFooter.displayName = 'DialogFooter';
