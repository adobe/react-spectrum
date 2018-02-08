import autobind from 'autobind-decorator';
import React, {Component} from 'react';
import Textfield from '../Textfield';

@autobind
export default class Textarea extends Component {
  handleHeightChange(value, e) {
    const {
      quiet,
      onChange,
    } = this.props;

    if (typeof onChange === 'function') {
      onChange(value, e);
    }

    if (quiet) {
      e.target.style.height = 'initial';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  }

  render() {
    const {
      quiet,
      ...otherProps
    } = this.props;

    return (
      <Textfield
        {...otherProps}
        multiLine
        quiet={quiet}
        onChange={this.handleHeightChange} />
    );
  }
}
