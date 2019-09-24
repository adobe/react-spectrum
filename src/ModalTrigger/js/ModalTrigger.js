/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import {chain} from '../../utils/events';
import ModalContainer from '../../ModalContainer';
import React, {cloneElement, Component} from 'react';

@autobind
export default class ModalTrigger extends Component {
  show() {
    const children = React.Children.toArray(this.props.children);
    const modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];
    this.modalKey = ModalContainer.show(modalChild, this, this.props.container);
  }

  hide() {
    if (this.modalKey) {
      ModalContainer.hide(this.modalKey);
      this.modalKey = null;
    }
  }

  render() {
    let {children, ...otherProps} = this.props;
    children = React.Children.toArray(children);
    if (children.length < 2) {
      console.warn(`ModalTrigger requires a trigger and a modal. \
        Number of children: ${children.length}.`
      );
    }
    let triggerChild = children.find(c => c.props.modalTrigger) || children[0];
    let modalChild = children.find(c => c.props.modalContent) || children[children.length - 1];

    delete otherProps.container;
    let trigger = cloneElement(triggerChild, {
      ...otherProps,
      onClick: chain(triggerChild.props.onClick, otherProps.onClick, this.show)
    });

    if (children.length === 2) {
      return trigger;
    }

    let Fragment = React.Fragment || 'div';

    return (
      <Fragment>
        {children.map((child) => {
          if (child === triggerChild) {
            return trigger;
          } else if (child === modalChild) {
            return null;
          } else {
            return child;
          }
        }, this)}
      </Fragment>
    );
  }
}
