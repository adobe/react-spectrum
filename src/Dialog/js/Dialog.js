import autobind from 'autobind-decorator';
import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import DialogHeader from './DialogHeader';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

@autobind
export default class Dialog extends Component {
  static propTypes = {
    backdropClickable: PropTypes.bool,
    cancelLabel: PropTypes.string,
    className: PropTypes.string,
    confirmLabel: PropTypes.string,
    onClose: PropTypes.func,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.string,
    variant: PropTypes.oneOf(['confirmation', 'information', 'destructive', 'error']),
    mode: PropTypes.oneOf(['centered', 'fullscreen', 'fullscreenTakeover']),
    role: PropTypes.oneOf(['dialog', 'alertdialog']),
  };

  static defaultProps = {
    backdropClickable: false,
    open: true,
    mode: 'centered',
    role: 'dialog',
    onClose: function () {}
  };

  /*
   * Calls the props.onConfirm() or props.onCancel() asynchronously if present,
   * then props.onClose() on any response except false
   */
  async _onAction(action) {
    let shouldClose = true;
    if (action) {
      shouldClose = await action();
    }
    if (shouldClose !== false) {
      this.props.onClose();
    }
  }

  onConfirm() {
    this._onAction(this.props.onConfirm);
  }

  onCancel() {
    this._onAction(this.props.onCancel);
  }

  render() {
    const {
      children,
      className = '',
      cancelLabel,
      confirmLabel,
      open,
      title,
      variant,
      mode,
      role,
      ...otherProps
    } = this.props;

    const fullscreen = mode === 'fullscreen' || mode === 'fullscreenTakeover';
    const derivedVariant = variant || (cancelLabel && confirmLabel ? 'confirmation' : 'information');

    delete otherProps.modalContent;
    delete otherProps['aria-modal'];
    delete otherProps.tabIndex;

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
        )}
        role={role}
        aria-modal="true"
        tabIndex={-1}>
        {title &&
          <DialogHeader
            variant={derivedVariant}
            title={title}
            fullscreen={fullscreen}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            {...otherProps}
            onConfirm={this.onConfirm}
            onCancel={this.onCancel} />
        }

        {title ? <div className="spectrum-Dialog-content">{children}</div> : children}

        {!fullscreen && confirmLabel &&
        <DialogButtons
          {...this.props}
          variant={derivedVariant}
          className="spectrum-Dialog-footer"
          onConfirm={this.onConfirm}
          onCancel={this.onCancel} />
        }
      </div>
    );
  }
}
