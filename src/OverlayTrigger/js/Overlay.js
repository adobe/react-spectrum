import autobind from 'autobind-decorator';
import OpenTransition from '../../utils/OpenTransition';
import Portal from 'react-overlays/lib/Portal';
import Position from './Position';
import React from 'react';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

@autobind
export default class Overlay extends React.Component {
  state = {
    exited: !this.props.show
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.show) {
      this.setState({exited: false});
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      this.setState({exited: true});
    }
  }

  onExited(...args) {
    this.setState({exited: true});
    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  }

  render() {
    let {
      container,
      containerPadding,
      target,
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
