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
import calculatePosition from './calculatePosition';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import getContainer from 'react-overlays/lib/utils/getContainer';
import ownerDocument from 'react-overlays/lib/utils/ownerDocument';
import React, {cloneElement} from 'react';
import ReactDOM from 'react-dom';

/**
 * The Position component calculates the coordinates for its child, to position
 * it relative to a `target` component or node. Useful for creating callouts
 * and tooltips, the Position component injects a `style` props with `left` and
 * `top` values for positioning your component.
 *
 * It also injects "arrow" `left`, and `top` values for styling callout arrows
 * for giving your components a sense of directionality.
 */
@autobind
export default class Position extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      positionLeft: 0,
      positionTop: 0,
      arrowOffsetLeft: null,
      arrowOffsetTop: null,
      placement: this.props.placement
    };

    this._needsFlush = false;
    this._lastTarget = null;
  }

  static defaultProps = {
    containerPadding: 10,
    offset: 0,
    crossOffset: 0
  };

  componentDidMount() {
    this.updatePosition(this.getTarget());
    window.addEventListener('resize', this.maybeUpdatePosition, false);
  }

  componentWillReceiveProps() {
    this._needsFlush = true;
  }

  componentDidUpdate(prevProps) {
    if (this._needsFlush) {
      this._needsFlush = false;
      this.maybeUpdatePosition(this.props.placement !== prevProps.placement);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.maybeUpdatePosition, false);
  }

  render() {
    const {children, className, ...props} = this.props;
    const {positionLeft, positionTop, maxHeight, arrowOffsetLeft, arrowOffsetTop, placement} = this.state;

    delete props.target;
    const child = React.Children.only(children);
    return cloneElement(
      child,
      {
        ...filterDOMProps(props),
        placement,
        className: classNames(className, child.props.className),
        arrowStyle: {
          left: arrowOffsetLeft,
          top: arrowOffsetTop
        },
        style: {
          ...child.props.style,
          position: 'absolute',
          zIndex: 100000, // should match the z-index in ModalTrigger
          left: positionLeft,
          top: positionTop,
          maxHeight: maxHeight
        }
      }
    );
  }

  getTarget() {
    const target = this.props.target;
    const targetElement = typeof target === 'function' ? target() : target;
    return targetElement && ReactDOM.findDOMNode(targetElement) || null;
  }

  maybeUpdatePosition(placementChanged) {
    const target = this.getTarget();

    if (
      !this.props.shouldUpdatePosition &&
      target === this._lastTarget &&
      !placementChanged
    ) {
      return;
    }

    this.updatePosition(target);
  }

  updatePosition(target) {
    const {
      placement,
      containerPadding,
      offset,
      crossOffset,
      flip,
      boundariesElement
    } = this.props;
    this._lastTarget = target;

    if (!target) {
      this.setState({
        positionLeft: 0,
        positionTop: 0,
        arrowOffsetLeft: null,
        arrowOffsetTop: null
      });

      return;
    }

    const overlay = ReactDOM.findDOMNode(this);
    const container = getContainer(
      this.props.container, ownerDocument(this).body
    );

    this.setState(calculatePosition(
      placement,
      overlay,
      target,
      container,
      containerPadding,
      flip,
      boundariesElement,
      offset,
      crossOffset
    ));
  }
}
