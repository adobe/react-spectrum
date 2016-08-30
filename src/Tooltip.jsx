import React, { Component } from 'react';
import classNames from 'classnames';
import TetherDropComponent from './internal/TetherDropComponent';
import manageTransitionVisibility from './utils/manageTransitionVisibility';

import { getTetherPositionFromPlacement } from './utils/tether';

import './Tooltip.styl';

export default class Tooltip extends Component {
  static defaultProps = {
    variant: 'inspect', // inspect, info, success, error
    placement: 'right', // right, left, top, bottom
    openOn: 'hover' // click, hover, focus, always
  };

  componentDidMount() {
    const { drop } = this.refs;
    this.transitionVisibilityManager = manageTransitionVisibility(drop.tetherDrop.drop);
  }

  componentWillUnmount() {
    this.transitionVisibilityManager.destroy();
  }

  onOpen = () => {
    this.transitionVisibilityManager.setIsOpen(true);
  };

  onClose = () => {
    this.transitionVisibilityManager.setIsOpen(false);
  };

  render() {
    const {
      variant,
      placement,
      content,
      children,
      className,
      openOn,
      ...otherProps
    } = this.props;

    return (
      <TetherDropComponent
        ref="drop"
        position={ getTetherPositionFromPlacement(placement) }
        openOn={ openOn }
        classPrefix="coral-Tooltip-drop"
        hoverOpenDelay={ 400 }
        hoverCloseDelay={ 400 }
        onOpen={ this.onOpen }
        onClose={ this.onClose }
        content={
          <div
            className={
              classNames(
                'coral3-Tooltip',
                `coral3-Tooltip--${ variant }`,
                className
              )
            }
            { ...otherProps }
          >
            { content }
          </div>
        }
      >
        { children }
      </TetherDropComponent>
    );
  }
}

Tooltip.displayName = 'Tooltip';
