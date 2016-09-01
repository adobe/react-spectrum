import React, { Component } from 'react';
import classNames from 'classnames';
import TetherDropComponent from './internal/TetherDropComponent';
import manageTransitionVisibility from './utils/manageTransitionVisibility';

import DialogHeader from './internal/DialogHeader';
import { getVariantIcon } from './utils/icon-variant';
import { getTetherPositionFromPlacement } from './utils/tether';

import './Popover.styl';

export default class Popover extends Component {
  static defaultProps = {
    variant: 'default', // default, error, warning, success, info, help
    open: false,
    closable: false,
    placement: 'right', // right, left, top, bottom, right top, right bottom, top right, etc
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
