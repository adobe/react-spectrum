import React, { Component } from 'react';
import classNames from 'classnames';
import TetherDropComponent from './internal/TetherDropComponent';
import { getTransitionEvent } from './utils/transition';

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

  state = {
    hidden: true
  };

  componentWillMount() {
    const { open } = this.props;
    if (open) {
      this.setState({ hidden: false });
    }
  }

  componentDidMount() {
    const { drop } = this.refs;
    drop.tetherDrop.drop.addEventListener(getTransitionEvent(), this.handleTransitionEnd);
  }

  componentWillReceiveProps(nextProps) {
    // If open is true, we should make sure the drop content is visible immediately.
    if (nextProps.open) {
      this.setState({ hidden: false });
    }
  }

  componentDidUpdate() {
    const { hidden } = this.state;
    const { drop } = this.refs;
    // If hidden, turn off visibility. Can't use display: none because we still want tether to
    // update position. Need to make the drop content non-visible so it can't be interacted with
    // on the page -- if we only had opacity = 0, the drop would cover parts of the underlying
    // page.
    drop.tetherDrop.drop.style.visibility = hidden ? 'hidden' : 'visible';
  }

  componentWillUnmount() {
    const { drop } = this.refs;
    if (drop && drop.tetherDrop) {
      drop.tetherDrop.drop.removeEventListener(getTransitionEvent(), this.handleTransitionEnd);
    }
  }

  handleTransitionEnd = e => {
    const { open } = this.props;

    // If the opacity transition has completed and it isn't open, hide the drop content.
    // This means, the opacity fade-out is finished.
    if (!open && e.propertyName === 'opacity') {
      this.setState({ hidden: true });
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
      onClose,
      ...otherProps
    } = this.props;

    return (
      <TetherDropComponent
        ref="drop"
        position={ getTetherPositionFromPlacement(placement) }
        open={ open }
        classPrefix="coral-Popover-drop"
        content={
          <div
            className={
              classNames(
                'coral3-Popover',
                `coral-Dialog--${ variant }`,
                {
                  'is-open': open
                },
                className
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
