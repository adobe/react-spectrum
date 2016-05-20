import React, { Component } from 'react';
import classNames from 'classnames';

import SwitchBase from './internal/SwitchBase';

export default class Checkbox extends Component {
  static defaultProps = {
    indeterminate: false
  };

  componentDidMount() {
    this.setIndeterminate();
  }

  componentDidUpdate() {
    this.setIndeterminate();
  }

  // There is no way to set indeterminate through markup such that it will be picked up by a CSS
  // indeterminate pseudo-selector. It can only be done via javascript.
  setIndeterminate() {
    const { indeterminate } = this.props;
    if (indeterminate != null && this.refs.input) {
      this.refs.input.getInput().indeterminate = indeterminate;
    }
  }

  render() {
    const {
      indeterminate,
      ...otherProps
    } = this.props;

    if (indeterminate) {
      otherProps['aria-checked'] = 'mixed';
    }

    return (
      <SwitchBase
        ref="input"
        inputType="checkbox"
        elementName="Checkbox"
        { ...otherProps }
      />
    );
  }
}
