import autobind from 'autobind-decorator';
import closest from 'dom-helpers/query/closest';
import OpenTransition from '../../utils/OpenTransition';
import Portal from 'react-overlays/lib/Portal';
import Position from './Position';
import React from 'react';
import ReactDOM from 'react-dom';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

@autobind
export default class Overlay extends React.Component {
  state = {
    exited: !this.props.show,
    targetNode: ReactDOM.findDOMNode(this.props.target)
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.show) {
      this.setState({...this.state, exited: false});
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      this.setState({...this.state, exited: true});
    }
    if (nextProps.target && nextProps.target !== this.props.target) {
      this.setState({...this.state, targetNode: ReactDOM.findDOMNode(nextProps.target)});
    }
  }

  onExited(...args) {
    this.setState({exited: true});
    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  }

  getOverlayContainer(target) {
    let immediateAvailableContainer = closest(this.state.targetNode, '.react-spectrum-provider');
    return this.props.container || immediateAvailableContainer;
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
      boundariesElement,
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
    let {onExit, onExiting, onEnter, onEntering, onEntered} = props;
    child = (
      <OpenTransition
        in={props.show}
        appear
        onExit={onExit}
        onExiting={onExiting}
        onExited={this.onExited}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}>
        {child}
      </OpenTransition>
    );

    // This goes after everything else because it adds a wrapping div.
    if (rootClose) {
      child = (
        <RootCloseWrapper onRootClose={props.onHide}>
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
