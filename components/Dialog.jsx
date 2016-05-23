import React, { Component } from 'react';
import classNames from 'classnames';
import TetherComponent from 'react-tether';
import Portal from 'react-portal';

import Icon from './Icon';
import Heading from './Heading';
import Button from './Button';
import { getVariantIcon } from '../helpers/icon-variant';

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
      className,
      title,
      children,
      footer,
      onOpen,
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
          <div className={
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
            style={{ position: 'static' }}
            { ...otherProps }
          >
            <div className="coral-Dialog-wrapper">
              {
                title
                ? <DialogHeader title={ title } icon={ icon } closable={ closable } onClose={ onClose } />
                : null
              }
              <DialogContent>{ children }</DialogContent>
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
}

const DialogHeader = ({
  title,
  icon,
  closable,
  onClose
}) => (
  <div className="coral-Dialog-header">
    {
      icon
      ? <Icon className="coral-Dialog-typeIcon" icon={ icon } size="S" />
      : null
    }
    <Heading size={ 2 } className="coral-Dialog-title">{ title }</Heading>
    {
      closable
      ?
      <Button
        variant="minimal"
        onClick={ onClose }
        className="coral-Dialog-closeButton"
        square
        size="M"
        icon="close"
        iconSize="XS"
      />
      : null
    }
  </div>
)

const DialogContent = ({
  children
}) => (
  <div className="coral-Dialog-content">
		{ children }
	</div>
)

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
}
