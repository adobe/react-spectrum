import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import DialogButtons from './DialogButtons';
import DialogHeader from './DialogHeader';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {trapFocus} from '../../utils/FocusManager';

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
    keyboardConfirm: PropTypes.bool,
    trapFocus: PropTypes.bool
  };

  static defaultProps = {
    backdropClickable: false,
    confirmDisabled: false,
    keyboardConfirm: false,
    open: true,
    role: 'dialog',
    autoFocusButton: null,
    onClose: function () {},
    trapFocus: true
  };

  constructor(props) {
    super(props);
    this.dialogId = createId();
  }

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

  onFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  onKeyDown(e) {
    const {confirmDisabled, keyboardConfirm, onKeyDown} = this.props;
    if (onKeyDown) {
      onKeyDown(e);

      // Do nothing if stopPropagation has been called on event after onKeyDown prop executes.
      if (e.isPropagationStopped && e.isPropagationStopped()) {
        return;
      }
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
      default:
        if (this.props.trapFocus) {
          trapFocus(this, e);
        }
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
      tabIndex,
      trapFocus,
      id = this.dialogId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-modal': ariaModal,
      ...otherProps
    } = this.props;

    const fullscreen = mode === 'fullscreen' || mode === 'fullscreenTakeover';
    const derivedVariant = variant || (cancelLabel && confirmLabel ? 'confirmation' : 'information');

    delete otherProps.modalContent;

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
        tabIndex={tabIndex === undefined || trapFocus ? 1 : tabIndex}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby || (title && !ariaLabel ? `${id}-heading` : null)}
        aria-describedby={ariaDescribedby || (title && children ? `${id}-content` : null)}
        aria-modal={ariaModal || trapFocus}>
        {title &&
          <DialogHeader
            variant={derivedVariant}
            title={title}
            fullscreen={fullscreen}
            confirmLabel={confirmLabel}
            secondaryLabel={secondaryLabel}
            cancelLabel={cancelLabel}
            id={`${id}-heading`}
            {...otherProps}
            onConfirm={this.onConfirm}
            onCancel={this.onCancel} />
        }

        {title ? <div className="spectrum-Dialog-content" id={`${id}-content`}>{children}</div> : children}

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
