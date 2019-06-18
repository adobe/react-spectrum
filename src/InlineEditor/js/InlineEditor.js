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
import PropTypes from 'prop-types';
import React, {Component}  from 'react';
import ReactDOM from 'react-dom';
import Textfield from '../../Textfield';
import '../style/index.styl';

@autobind
export default class InlineEditor extends Component {
  static propTypes = {
    /**
     * Value component is initally set to
     */
    defaultValue: PropTypes.string,

    /**
     * puts it into a controlled state
     */
    value: PropTypes.string,

    /**
     * Prevents the value from being editiable, only renders value as label
     */
    disabled: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      editing: !!this.props.autoFocus,
      value: this.props.value || this.props.defaultValue || '',
      invalid: false
    };
  }

  componentWillReceiveProps(props) {
    if (props.value != null && props.value !== this.props.value) {
      this.setState({value: props.value});
    }
  }

  onChange(value) {
    this.setState({value});
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      this.endEditing(true);
    } else if (e.key === 'Escape') {
      this.endEditing(false);
    }
  }

  startEditing() {
    this.setState({
      editing: true,
      startValue: this.state.value,
      invalid: false
    });
  }

  async endEditing(shouldSave = true) {
    let contEditing = false;
    let value = shouldSave ? this.state.value : this.state.startValue;
    if (shouldSave && this.props.onChange) {
      contEditing = (await this.props.onChange(value) === false);
    } else if (!shouldSave && this.props.onCancel) {
      this.props.onCancel();
    }
    this.setState({
      editing: contEditing,
      value: this.props.value == null ? value : this.props.value,
      invalid: contEditing
    });
  }

  focusTextfield(textfield) {
    if (textfield) {
      let input = ReactDOM.findDOMNode(textfield);
      input.focus();
      input.select();
    }
  }

  renderLabel() {
    let {className, disabled} = this.props;

    return (
      <span
        className={classNames('react-spectrum-InlineEditor', 'react-spectrum-InlineEditor-label', className)}
        onDoubleClick={!disabled ? this.startEditing : undefined}>
        {this.state.value}
      </span>
    );
  }

  renderEditor() {
    let {className, ...props} = this.props;

    return (
      <Textfield
        {...props}
        ref={this.focusTextfield}
        className={classNames('react-spectrum-InlineEditor', 'react-spectrum-InlineEditor-input', className)}
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        onBlur={this.endEditing}
        invalid={this.state.invalid} />
    );
  }

  render() {
    return this.state.editing ? this.renderEditor() : this.renderLabel();
  }
}
