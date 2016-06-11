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
      footer,
      className,
      onClose,
      ...otherProps
    } = this.props;

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
              title &&
                <DialogHeader
                  title={ title }
                  icon={ icon }
                  closable={ closable }
                  onClose={ onClose }
                />
            }
            <div className="coral-Dialog-content">{ children }</div>
            <DialogFooter onClose={ onClose }>{ footer }</DialogFooter>
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

const DialogFooter = ({
  children,
  onClose
}) => {
  return (
    <div className="coral-Dialog-footer">
      {
        children || <Button variant="primary" label="OK" onClick={ onClose } />
      }
    </div>
  );
};
