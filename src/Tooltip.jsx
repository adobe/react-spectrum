import React, { Component } from 'react';
import classNames from 'classnames';
import TetherDropComponent from './internal/TetherDropComponent';

import { getTetherPositionFromPlacement } from './utils/tether';

import './Tooltip.styl';

export default class Tooltip extends Component {
  static defaultProps = {
    variant: 'inspect', // inspect, info, success, error
    open: false,
    placement: 'right', // right, left, top, bottom
    openOn: 'hover', // click, hover, focus, always
    onClose: () => {}
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
        position={ getTetherPositionFromPlacement(placement) }
        openOn={ openOn }
        classPrefix="coral-Tooltip-drop"
        hoverOpenDelay={ 400 }
        hoverCloseDelay={ 400 }
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
