import classNames from 'classnames';
import DialogContent from './DialogContent';
import DialogFooter from './DialogFooter';
import DialogHeader from './DialogHeader';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

let variantType = ['default', 'error', 'help', 'info', 'success', 'warning'];

export default class Dialog extends Component {
  static propTypes = {
    cancelLabel: PropTypes.string,
    className: PropTypes.string,
    confirmLabel: PropTypes.string,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    open: PropTypes.bool,
    size: PropTypes.oneOf(['S', 'M', 'L']),
    title: PropTypes.string,
    variant: PropTypes.oneOf(variantType)
  };

  static defaultProps = {
    open: true,
    variant: 'default',
    onClose: function () {},
    size: 'M'
  };

  /*
   * Calls the props.onConfirm() asynchronously if present,
   * then props.onClose() on any response except false
   */
  async onConfirm() {
    let shouldClose = true;
    if (this.props.onConfirm) {
      shouldClose = await this.props.onConfirm();
    }
    if (shouldClose !== false) {
      this.props.onClose();
    }
  }

  render() {
    const {
      children,
      className,
      confirmLabel,
      open,
      size,
      title,
      variant
    } = this.props;

    return (
      <div
        className={classNames(
          'spectrum-Dialog',
          `spectrum-Dialog--${variant}`,
          `spectrum-Dialog--${size}`,
          {
            'is-open': open
          },
          className
        )}>
        <div className="spectrum-Dialog-wrapper">
          {title && <DialogHeader variant={variant} title={title} />}
          <DialogContent>
            {
              React.Children.map(children, child => (
                React.cloneElement(child, {})
              ))
            }
          </DialogContent>
          {confirmLabel && <DialogFooter {...this.props} onConfirm={this.onConfirm.bind(this)} />}
        </div>
      </div>
    );
  }
}
