import React, { Component } from 'react';
import classNames from 'classnames';
import TetherComponent from 'react-tether';
import Portal from 'react-portal';

import DialogHeader from './internal/DialogHeader';
import Button from './Button';
import { getVariantIcon } from './utils/icon-variant';

const BACKDROP_NONE = 'none';
const BACKDROP_MODAL = 'modal';
const BACKDROP_STATIC = 'static';

export default class Dialog extends Component {
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
      title,
      children,
      className,
      onClose,
      ...otherProps
    } = this.props;
    const normalizedChildren = {};
    React.Children.forEach(children, ((child) => {
      if (child.props) {
        normalizedChildren[child.type] = child.props.children;
      }
    }));

    return (
      <TetherComponent
        attachment="middle center"
        target={ document.body }
        targetModifier="visible"
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
              (title || normalizedChildren['dialog-header']) &&
                <DialogHeader
                  icon={ icon }
                  closable={ closable }
                  onClose={ onClose }
                >
                  { title || normalizedChildren['dialog-header'] }
                </DialogHeader>
            }
            <div className="coral-Dialog-content">{ normalizedChildren['dialog-content'] }</div>
            <DialogFooter onClose={ onClose }>{ normalizedChildren['dialog-footer'] }</DialogFooter>
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
      />
    </Portal>
  );
};

// const addClose = (children)=>{
//   return React.Children.map((child) =>{
//     if (child.props && child.props.children) {
//       addClose(child.props.children)
//     }else {
//       return child;
//     }
//   });
// }

function addClose(children, onClose) {
  return React.Children.map(children, child => {
    if (React.isValidElement(child) && child.props && child.props['close-dialog']) {
      // String has no Prop
      return React.cloneElement(child, {
        children: addClose(child.props.children),
        onClose: (...args) => {
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

const DialogFooter = ({
  children,
  onClose
}) => {
  return (
    <div className="coral-Dialog-footer">
      {
        children ? addClose(children) : <Button variant="primary" label="OK" onClick={ onClose } />
      }
    </div>
  );
};
