import autobind from 'autobind-decorator';
import classNames from 'classnames';
import DialogButtons from './DialogButtons';
import DialogHeader from './DialogHeader';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('dialog');

@autobind
export default class Dialog extends Component {
  static propTypes = {
    backdropClickable: PropTypes.bool,
    cancelLabel: PropTypes.string,
    className: PropTypes.string,
    confirmDisabled: PropTypes.bool,
    confirmLabel: PropTypes.string,
    secondaryLabel: PropTypes.string,
    onClose: PropTypes.func,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.node,
    variant: PropTypes.oneOf(['confirmation', 'information', 'destructive', 'error']),
    mode: PropTypes.oneOf(['alert', 'fullscreen', 'fullscreenTakeover']),
    role: PropTypes.oneOf(['dialog', 'alertdialog']),
    autoFocusButton: PropTypes.oneOf(['cancel', 'confirm', 'secondary', null]),
    keyboardConfirm: PropTypes.bool
  };

  static defaultProps = {
    backdropClickable: false,
    confirmDisabled: false,
    keyboardConfirm: false,
    open: true,
    role: 'dialog',
    autoFocusButton: null,
    onClose: function () {}
  };

  /*
   * Calls the props.onConfirm() or props.onCancel() asynchronously if present,
   * then props.onClose() on any response except false
   */
  async _onAction(action, ...args) {
    let shouldClose = true;
    if (action) {
      shouldClose = await action(...args);
    }
    if (shouldClose !== false) {
      this.props.onClose();
    }
  }

  onConfirm(...args) {
    this._onAction(this.props.onConfirm, ...args);
  }

  onCancel() {
    this._onAction(this.props.onCancel);
  }

  onKeyDown(e) {
    const {confirmDisabled, keyboardConfirm, onKeyDown} = this.props;
    if (onKeyDown) {
      onKeyDown(e);
    }
    switch (e.key) {
      case 'Enter':
        if (!confirmDisabled && keyboardConfirm) {
          this.onConfirm();
        }
        break;
      case 'Esc':
      case 'Escape':
        this.onCancel();
        break;
    }
  }

  render() {
    const {
      children,
      className = '',
      cancelLabel,
      confirmLabel,
      secondaryLabel,
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
    delete otherProps.tabIndex;

    return (
      <div
        className={classNames(
          'spectrum-Dialog',
          'react-spectrum-Dialog',
          {
            [`spectrum-Dialog--${mode}`]: mode,
            'spectrum-Dialog--error': variant === 'error',
            'is-open': open
          },
          className
        )}
        role={role}
        tabIndex={-1}
        onKeyDown={this.onKeyDown}>
        {title &&
          <DialogHeader
            variant={derivedVariant}
            title={title}
            fullscreen={fullscreen}
            confirmLabel={confirmLabel}
            secondaryLabel={secondaryLabel}
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
