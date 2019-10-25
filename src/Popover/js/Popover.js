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
import classNames from 'classnames';
import createId from '../../utils/createId';
import DialogHeader from '../../Dialog/js/DialogHeader';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {trapFocus} from '../../utils/FocusManager';
import '../style/index.styl';

importSpectrumCSS('popover');
importSpectrumCSS('dialog');

@autobind
export default class Popover extends Component {
  static propTypes = {
    /**
     * The variant will affect color and add an icon.
     */
    variant: PropTypes.oneOf(['default', 'error']),

    /**
     * The position of the popover. If used with overlay trigger and there isn't enough room
     * for the tooltip in that position, it will make a limited attempt to find a new position.
     */
    placement: PropTypes.oneOf([
      'bottom', 'bottom left', 'bottom right',
      'top', 'top left', 'top right',
      'left', 'left top', 'left bottom',
      'right', 'right top', 'right bottom'
    ]),

    /**
     * Whether the popover is opened.
     */
    open: PropTypes.bool,

    /**
     * The title of the popover.
     */
    title: PropTypes.node,

    /**
     * The css class name of the popover.
     */
    className: PropTypes.string,

    /**
     * Whether the focus should be trapped.
     */
    trapFocus: PropTypes.bool
  };

  static defaultProps = {
    variant: 'default',
    placement: 'bottom',
    open: true,
    trapFocus: true
  };

  constructor(props) {
    super(props);
    this.defaultId = createId();
  }

  componentDidMount() {
    if (this.props.trapFocus) {
      this._trapFocusTimeout = requestAnimationFrame(() => {
        if (this.popoverRef && !this.popoverRef.contains(document.activeElement)) {
          this.popoverRef.focus();
        }
      });
    }
  }

  componentWillUnmount() {
    if (this._trapFocusTimeout) {
      cancelAnimationFrame(this._trapFocusTimeout);
    }
  }

  onFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
    if (this.props.trapFocus &&
      e.target === this.popoverRef &&
      !this.popoverRef.contains(e.relatedTarget)) {
      trapFocus(this, e);
    }
  }

  onKeyDown(e) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);

      // Do nothing if stopPropagation has been called on event after onKeyDown prop executes.
      if (e.isPropagationStopped && e.isPropagationStopped()) {
        return;
      }
    }

    if (this.props.trapFocus) {
      trapFocus(this, e);
    }
  }

  render() {
    const {
      variant,
      placement,
      arrowStyle,
      open,
      title,
      children,
      className,
      isDialog = true, // private. for use only by Menu.
      trapFocus,
      tabIndex = null,
      id = this.defaultId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...otherProps
    } = this.props;

    delete otherProps.target;

    let content = isDialog ? <div className="spectrum-Dialog-content" role="presentation" id={`${id}-content`}>{children}</div> : children;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        ref={p => this.popoverRef = p}
        className={
          classNames(
            'spectrum-Popover',
            'react-spectrum-Popover',
            `spectrum-Popover--${placement.split(' ')[0]}`,
            {
              'spectrum-Popover--withTip': isDialog,
              'spectrum-Popover--dialog': isDialog,
              [`spectrum-Dialog--${variant}`]: isDialog,
              'is-open': open
            },
            className
          )
        }
        role={isDialog ? 'dialog' : 'presentation'}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby || (isDialog && title && !ariaLabel ? `${id}-heading` : null)}
        aria-describedby={ariaDescribedby || (isDialog && title && children ? `${id}-content` : null)}
        data-testid="popover"
        {...filterDOMProps(otherProps)}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        tabIndex={trapFocus && tabIndex === null ? 1 : tabIndex}>
        {isDialog && title &&
          <DialogHeader
            id={`${id}-heading`}
            title={title}
            variant={variant} />
        }
        {content}
        {isDialog && <div className="spectrum-Popover-tip" style={arrowStyle} aria-hidden="true" data-testid="tip" />}
      </div>
    );
  }
}

Popover.displayName = 'Popover';
