import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import TetherDropComponent from '../../internal/TetherDropComponent';
import manageTransitionVisibility from '../../utils/manageTransitionVisibility';

import DialogHeader from '../../Dialog/js/DialogHeader';
import { getVariantIcon } from '../../utils/icon-variant';
import { getTetherPositionFromPlacement } from '../../utils/tether';

import '../style/index.styl';

export default class Popover extends Component {
  static propTypes = {
    variant: PropTypes.oneOf(['default', 'error', 'warning', 'success', 'info', 'help']),
    icon: PropTypes.string,
    open: PropTypes.bool,
    closable: PropTypes.bool,
    title: PropTypes.node,
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
    placement: PropTypes.string, // right, left, top, bottom, right top, right bottom, top right...
    className: PropTypes.string,
    dropClassName: PropTypes.string,
    onClose: PropTypes.func,
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
    })
  };

  static defaultProps = {
    variant: 'default',
    open: false,
    closable: false,
    placement: 'right',
    attachmentConstraints: {
      to: 'window',
      attachment: 'together'
    },
    onClose: () => {}
  };

  componentDidMount() {
    const { drop } = this.refs;
    this.transitionVisibilityManager = manageTransitionVisibility(
      drop.tetherDrop.drop,
      this.props.open
    );
  }

  componentWillReceiveProps(nextProps) {
    // Won't be defined when shallow rendering.
    if (this.transitionVisibilityManager) {
      this.transitionVisibilityManager.setIsOpen(nextProps.open);
    }
  }

  componentWillUnmount() {
    if (this.transitionVisibilityManager) {
      this.transitionVisibilityManager.destroy();
    }
  }

  render() {
    const {
      closable,
      variant,
      icon = variant ? getVariantIcon(variant) : null,
      open,
      title,
      placement,
      content,
      attachmentConstraints,
      children,
      className,
      dropClassName,
      onClose,
      ...otherProps
    } = this.props;

    return (
      <TetherDropComponent
        className={ className }
        ref="drop"
        position={ getTetherPositionFromPlacement(placement) }
        open={ open }
        classPrefix="coral-Popover-drop"
        dropClassName={ dropClassName }
        constraints={ attachmentConstraints }
        content={
          <div
            className={
              classNames(
                'coral3-Popover',
                `coral-Dialog--${ variant }`,
                {
                  'is-open': open
                }
              )
            }
            { ...otherProps }
          >
            {
              title &&
                <DialogHeader
                  title={ title }
                  icon={ icon }
                  closable={ closable }
                  onClose={ onClose }
                />
            }
            <div className="coral3-Popover-content">{ content }</div>
          </div>
        }
        onClickOutside={ onClose }
      >
        { children }
      </TetherDropComponent>
    );
  }
}

Popover.displayName = 'Popover';
