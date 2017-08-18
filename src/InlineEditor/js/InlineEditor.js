import autobind from 'autobind-decorator';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import Textfield from '../../Textfield';
import '../style/index.styl';

@autobind
export default class InlineEditor extends React.Component {
  state = {
    editing: false,
    value: this.props.value || this.props.defaultValue || ''
  };

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
      startValue: this.state.value
    });
  }

  endEditing(shouldSave = true) {
    let value = shouldSave ? this.state.value : this.state.startValue;
    this.setState({
      editing: false,
      value: this.props.value == null ? value : this.props.value
    });

    if (shouldSave && this.props.onChange) {
      this.props.onChange(value);
    }
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
        className={classNames('coral-InlineEditor', 'coral-InlineEditor-label', className)}
        onDoubleClick={!disabled && this.startEditing}>
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
        className={classNames('coral-InlineEditor', 'coral-InlineEditor-input', className)}
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        onBlur={this.endEditing} />
    );
  }

  render() {
    return this.state.editing ? this.renderEditor() : this.renderLabel();
  }
}
