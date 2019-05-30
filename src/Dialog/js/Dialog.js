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
    /**
     * Can dismiss by clicking on the backdrop
     */
    backdropClickable: PropTypes.bool,

    /**
     * Label of the cancel button
     */
    cancelLabel: PropTypes.string,

    /**
     * String of custom class names to add to the top level dom element of Dialog
     */
    className: PropTypes.string,

    /**
     * Confirm button is disabled
     */
    confirmDisabled: PropTypes.bool,

    /**
     * Label of the confirm button
     */
    confirmLabel: PropTypes.string,

    /**
     * Label for an additional button
     */
    secondaryLabel: PropTypes.string,

    /**
     * Callback when dialog closes
     */
    onClose: PropTypes.func,

    /**
     * Callback when cancel button clicked
     */
    onCancel: PropTypes.func,

    /**
     * Callback when confim button clicked. Has a paramater specifying which
     * confirm button is clicked, "primary" or "secondary".
     */
    onConfirm: PropTypes.func,

    /**
     * Have dialog opened when mounted to DOM
     */
    open: PropTypes.bool,

    /**
     * Title of the dialog
     */
    title: PropTypes.node,

    /**
     * Affects the style used by the dialog, establishing its type
     */
    variant: PropTypes.oneOf(['confirmation', 'information', 'destructive', 'error']),

    /**
     *  Affects the display size of the dialog
     */
    mode: PropTypes.oneOf(['alert', 'fullscreen', 'fullscreenTakeover']),

    /**
     * For ARIA telling what type of dialog this is
     */
    role: PropTypes.oneOf(['dialog', 'alertdialog']),

    /**
     * Which button should be autoFocused after mounted to DOM
     */
    autoFocusButton: PropTypes.oneOf(['cancel', 'confirm', 'secondary', null]),

    /**
     * When true, allows user to press enter key and trigger confirm event and close dialog.
     * When false, the user can still use keyboard navigation to close via the comfirm button.
     */
    keyboardConfirm: PropTypes.bool,

    /**
     * Keeps focus from escaping dialog
     */
    trapFocus: PropTypes.bool,

    /**
     * When true, the Esc key will not close the Dialog or trigger an onCancel event.
     * Use for rare cases when a Dialog requires confirmation before being dismissed.
     */
    disableEscKey: PropTypes.bool
  };

  static defaultProps = {
    backdropClickable: false,
    confirmDisabled: false,
    keyboardConfirm: false,
    open: true,
    role: 'dialog',
    autoFocusButton: null,
    onClose: function () {},
    trapFocus: true,
    disableEscKey: false
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
    const {confirmDisabled, keyboardConfirm, onKeyDown, disableEscKey} = this.props;
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
        if (!disableEscKey) {
          this.onCancel();
        }
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
    delete otherProps.disableEscKey;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
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
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
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
