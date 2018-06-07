import autobind from 'autobind-decorator';
import classNames from 'classnames';
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
    variant: PropTypes.oneOf(['default', 'error']),
    placement: PropTypes.oneOf([
      'bottom', 'bottom left', 'bottom right',
      'top', 'top left', 'top right',
      'left', 'left top', 'left bottom',
      'right', 'right top', 'right bottom'
    ]),
    open: PropTypes.bool,
    title: PropTypes.node,
    className: PropTypes.string,
    trapFocus: PropTypes.bool
  };

  static defaultProps = {
    variant: 'default',
    placement: 'bottom',
    open: true,
    trapFocus: true
  };

  onFocus(e) {
    if (this.props.trapFocus) {
      trapFocus(this, e);
    }
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  onKeyDown(e) {
    if (this.props.trapFocus) {
      trapFocus(this, e);
    }
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
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
      ...otherProps
    } = this.props;

    let content = isDialog ? <div className="spectrum-Dialog-content">{children}</div> : children;

    delete otherProps.onFocus;
    delete otherProps.onKeyDown;

    return (
      <div
        className={
          classNames(
            'spectrum-Popover',
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
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        tabIndex={trapFocus && tabIndex === null ? 1 : tabIndex}
        {...filterDOMProps(otherProps)}>
        {isDialog && title &&
          <DialogHeader
            title={title}
            variant={variant} />
        }
        {content}
        {isDialog && <div className="spectrum-Popover-tip" style={arrowStyle} />}
      </div>
    );
  }
}

Popover.displayName = 'Popover';
