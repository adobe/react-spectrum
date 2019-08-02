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
import closest from 'dom-helpers/query/closest';
import OpenTransition from '../../utils/OpenTransition';
import ownerDocument from 'react-overlays/lib/utils/ownerDocument';
import Portal from 'react-overlays/lib/Portal';
import Position from './Position';
import React from 'react';
import ReactDOM from 'react-dom';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

const VISIBLE_OVERLAYS = new Map;
const DEFAULT_BUCKET_KEY = 'none';

@autobind
export default class Overlay extends React.Component {
  static defaultProps = {
    placement: 'left'
  };

  constructor(props) {
    super(props);
    this.state = {
      exited: !this.props.show
    };
  }

  get overlayBucketKey() {
    const {children} = this.props;
    if (children && children.props) {
      return children.props.role || DEFAULT_BUCKET_KEY;
    }
    return DEFAULT_BUCKET_KEY;
  }

  componentDidMount() {
    this.setState({targetNode: ReactDOM.findDOMNode(this.props.target)});
    this.mounted = true;
    this.addOverlay();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.removeOverlay();
  }

  addOverlay(props = this.props) {
    const {overlayBucketKey} = this;
    let visibleOverlays = VISIBLE_OVERLAYS.get(overlayBucketKey);
    if (!visibleOverlays) {
      VISIBLE_OVERLAYS.set(overlayBucketKey, []);
      visibleOverlays = VISIBLE_OVERLAYS.get(overlayBucketKey);
    }
    if (props.show && this.mounted && !visibleOverlays.includes(this)) {
      visibleOverlays.push(this);
    }
  }

  removeOverlay() {
    // Remove overlay from the stack of visible overlays
    const visibleOverlays = VISIBLE_OVERLAYS.get(this.overlayBucketKey);
    let index = visibleOverlays.indexOf(this);
    if (index >= 0) {
      visibleOverlays.splice(index, 1);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.target && nextProps.target !== this.props.target) {
      this.setState({...this.state, targetNode: ReactDOM.findDOMNode(nextProps.target)});
    }
  }

  onEntered(...args) {
    this.setState({...this.state, exited: false});
    this.addOverlay();

    if (this.props.onEntered) {
      this.props.onEntered(...args);
    }
  }

  onExited(...args) {
    this.setState({...this.state, exited: true});
    this.removeOverlay();

    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  }

  getOverlayContainer(target) {
    let immediateAvailableContainer = closest(this.state.targetNode, '.react-spectrum-provider');
    return this.props.container || immediateAvailableContainer;
  }

  hide(e) {
    const visibleOverlays = VISIBLE_OVERLAYS.get(this.overlayBucketKey);
    // Only hide if this is the top overlay
    if (visibleOverlays[visibleOverlays.length - 1] === this && this.props.onHide) {
      this.props.onHide(e);
    }
  }

  render() {
    let {
      containerPadding,
      target,
      container = this.getOverlayContainer(target),
      placement,
      offset,
      crossOffset,
      flip,
      boundariesElement = () => ownerDocument(this).body,
      shouldUpdatePosition,
      rootClose,
      children,
      ...props
    } = this.props;

    // Don't un-render the overlay while it's transitioning out.
    const mountOverlay = props.show || !this.state.exited;
    if (!mountOverlay) {
      // Don't bother showing anything if we don't have to.
      return null;
    }

    let child = children;

    // Position is be inner-most because it adds inline styles into the child,
    // which the other wrappers don't forward correctly.
    child = (
      <Position {...{container, containerPadding, target, placement, shouldUpdatePosition, offset, crossOffset, flip, boundariesElement}}>
        {child}
      </Position>
    );

    // This animates the child node by injecting props, so it must precede
    // anything that adds a wrapping div.
    let {onExit, onExiting, onEnter, onEntering} = props;
    child = (
      <OpenTransition
        in={props.show}
        appear
        onExit={onExit}
        onExiting={onExiting}
        onExited={this.onExited}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={this.onEntered}>
        {child}
      </OpenTransition>
    );

    // This goes after everything else because it adds a wrapping div.
    if (rootClose) {
      child = (
        <RootCloseWrapper onRootClose={this.hide}>
          {child}
        </RootCloseWrapper>
      );
    }

    return (
      <Portal container={container}>
        {child}
      </Portal>
    );
  }
}
