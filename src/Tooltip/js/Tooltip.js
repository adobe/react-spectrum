import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import TetherDropComponent from '../../internal/TetherDropComponent';
import manageTransitionVisibility from '../../utils/manageTransitionVisibility';

import { getTetherPositionFromPlacement } from '../../utils/tether';

import '../style/index.styl';

const ARROWS = {
  right: 'arrowRight',
  left: 'arrowLeft',
  bottom: 'arrowDown',
  top: 'arrowUp'
};

export default class Tooltip extends Component {
  static propTypes = {
    variant: PropTypes.oneOf(['inspect', 'info', 'success', 'error']),
    placement: PropTypes.string,
    openOn: PropTypes.oneOf(['click', 'hover', 'focus', 'always']),
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    className: PropTypes.string,
    hoverOpenDelay: PropTypes.number,
    hoverCloseDelay: PropTypes.number,
    // Customize how to constrain the popover so it pins to the edge of the window,
    // scroll container, etc, or if it flips when it would otherwise be clipped.
    // This is passed to tether internally. See http://tether.io/#constraints
    attachmentConstraints: PropTypes.shape({
      to: PropTypes.string,
      attachment: PropTypes.string,
      pin: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ])
    }),
    // Additional options to be passed to tether
    tetherOptions: PropTypes.shape({
      offset: PropTypes.string,
      targetOffset: PropTypes.string,
      targetModifier: PropTypes.string
    })
  };

  static defaultProps = {
    variant: 'inspect',
    placement: 'right',
    openOn: 'hover',
    attachmentConstraints: {
      to: 'window',
      attachment: 'together'
    }
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
      attachmentConstraints,
      className,
      openOn,
      hoverOpenDelay = 400,
      hoverCloseDelay = 400,
      tetherOptions,
      ...otherProps
    } = this.props;

    return (
      <TetherDropComponent
        ref="drop"
        position={ getTetherPositionFromPlacement(placement) }
        openOn={ openOn }
        classPrefix="coral-Tooltip-drop"
        hoverOpenDelay={ hoverOpenDelay }
        hoverCloseDelay={ hoverCloseDelay }
        constraints={ attachmentConstraints }
        tetherOptions={ tetherOptions }
        onOpen={ this.onOpen }
        onClose={ this.onClose }
        content={
          <div
            className={
              classNames(
                'coral3-Tooltip',
                `coral3-Tooltip--${ variant }`,
                `coral3-Tooltip--${ARROWS[placement]}`,
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
