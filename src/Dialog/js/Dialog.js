import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import DialogHeader from './DialogHeader';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

export default class Dialog extends Component {
  static propTypes = {
    cancelLabel: PropTypes.string,
    className: PropTypes.string,
    confirmLabel: PropTypes.string,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.string,
    variant: PropTypes.oneOf(['confirmation', 'information', 'destructive', 'error']),
    mode: PropTypes.oneOf(['centered', 'fullscreen', 'fullscreenTakeover'])
  };

  static defaultProps = {
    open: true,
    mode: 'centered',
    onClose: function () {}
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
      cancelLabel,
      confirmLabel,
      open,
      title,
      variant,
      mode
    } = this.props;

    const fullscreen = mode === 'fullscreen' || mode === 'fullscreenTakeover';
    const derivedVariant = variant || (cancelLabel && confirmLabel ? 'confirmation' : 'information');

    return (
      <div
        className={classNames(
          'spectrum-Dialog',
          `spectrum-Dialog--${mode}`,
          {
            'spectrum-Dialog--error': variant === 'error',
            'is-open': open
          },
          className
        )}>
        {title &&
          <DialogHeader
            variant={derivedVariant}
            title={title}
            fullscreen={fullscreen}
            {...this.props}
            onConfirm={this.onConfirm.bind(this)} />
        }

        {title ? <div className="spectrum-Dialog-content">{children}</div> : children}

        {!fullscreen && confirmLabel &&
          <DialogButtons
            {...this.props}
            variant={derivedVariant}
            className="spectrum-Dialog-footer"
            onConfirm={this.onConfirm.bind(this)} />
        }
      </div>
    );
  }
}
