import React, { Component } from 'react';
import classNames from 'classnames';
import TetherComponent from 'react-tether';
import Portal from 'react-portal';

import DialogHeader from './internal/DialogHeader';
import DialogFooter from './internal/DialogFooter';
import { getVariantIcon } from './utils/icon-variant';

const BACKDROP_NONE = 'none';
const BACKDROP_MODAL = 'modal';
const BACKDROP_STATIC = 'static';

class Dialog extends Component {
  static defaultProps = {
    backdrop: BACKDROP_MODAL, // none, modal, static
    closable: false,
    variant: 'default', // default, error, warning, success, info, help
    open: false,
    onClose: () => {}
  };

  render() {
    const {
      backdrop,
      closable,
      variant,
      icon = getVariantIcon(variant || 'default'),
      open,
      children,
      className,
      onClose,
      ...otherProps
    } = this.props;
    const normalizedChildren = {};
    React.Children.forEach(children, ((child) => {
      if (typeof child.type === 'function') {
        normalizedChildren[child.type.name] = child;
      }
    }));

    return (
      <TetherComponent
        attachment="middle center"
        target={ document.body }
        targetModifier="visible"
        style={ { zIndex: open ? 10020 : 10010 } }
      >
        <DialogBackdrop open={ open } backdrop={ backdrop } onClose={ onClose } />
        <div
          className={
            classNames(
              'coral-Dialog',
              `coral-Dialog--${ variant }`,
              {
                'coral-Dialog--closable': closable,
                'is-open': open
              },
              className
            )
          }
          style={ { position: 'static' } }
          { ...otherProps }
        >
          <div className="coral-Dialog-wrapper">
            {
              normalizedChildren.DialogHeader ?
                React.cloneElement(normalizedChildren.DialogHeader, {
                  icon,
                  closable,
                  onClose,
                  ...normalizedChildren.DialogHeader.props
                }) :
                <DialogHeader
                  icon={ icon }
                  closable={ closable }
                  onClose={ onClose }
                />
            }
            {
              normalizedChildren.DialogContent ||
              <DialogContent>{ children }</DialogContent>
            }
            {
              normalizedChildren.DialogFooter ?
                React.cloneElement(normalizedChildren.DialogFooter, { onClose }) :
                <DialogFooter onClose={ onClose } />
            }
          </div>
        </div>
      </TetherComponent>
    );
  }
}

const DialogBackdrop = ({
  open,
  backdrop,
  onClose
}) => {
  onClose = backdrop === BACKDROP_STATIC ? () => {} : onClose;

  return (
    <Portal
      isOpened={ open }
    >
      <div
        className={
          classNames({
            'coral-Backdrop': backdrop !== BACKDROP_NONE,
            'is-open': open
          })
        }
        onClick={ onClose }
        style={ { zIndex: 10009 } }
      />
    </Portal>
  );
};

function DialogContent({
  className,
  children,
  ...otherProps
}) {
  return (
    <div className={ classNames('coral-Dialog-content', className) } { ...otherProps }>
      { children }
    </div>
  );
}

Dialog.Header = DialogHeader;
Dialog.Footer = DialogFooter;
Dialog.Content = DialogContent;
export default Dialog;
