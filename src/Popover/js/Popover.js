import classNames from 'classnames';
import DialogHeader from '../../Dialog/js/DialogHeader';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

importSpectrumCSS('popover');
importSpectrumCSS('dialog');

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
    className: PropTypes.string
  };

  static defaultProps = {
    variant: 'default',
    placement: 'bottom',
    open: true
  };

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
      ...otherProps
    } = this.props;

    let content = isDialog ? <div className="spectrum-Dialog-content">{children}</div> : children;

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
