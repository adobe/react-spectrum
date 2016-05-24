import React, { Component } from 'react';
import classNames from 'classnames';

import Textfield from './Textfield';
import Button from './Button';
import Icon from './Icon';

export default class Search extends Component {
  static defaultProps = {
    onChange: () => {},
    onClear: () => {},
    onSubmit: () => {}
  };

  constructor(props) {
    super(props);

    const {
      value,
      defaultValue
    } = props;

    this.state = {
      emptyText: !value && !defaultValue,
      value: value || defaultValue || ''
    }
  }

  handleTextKeyDown = e => {
    const { onSubmit, disabled } = this.props;
    const { value } = this.state;
    const key = e.which;

    if (key === 13 || key === 27) {
      e.preventDefault();
    }

    if (key === 13 && !disabled) {
      onSubmit(value);
    }

    if (key === 27 && !disabled) {
      this.handleClearText();
    }
  }

  handleTextChange = e => {
    const { onChange } = this.props;

    this.setState({
      value: e.target.value,
      emptyText: e.target.value === ''
    });
    onChange();
  }

  handleClearText = () => {
    const { onClear, onChange, disabled } = this.props;

    if (disabled) {
      return;
    }

    if (this.refs.input) {
      if (!('value' in this.props)) {
        this.setState({
          value: '',
          emptyText: true
        });
      }
    }
    onClear();
    onChange();
  }

  render() {
    const {
      disabled,
      defaultValue,
      className,
      ...otherProps
    } = this.props;
    const { value, emptyText } = this.state;

    return (
      <div
        className={
          classNames(
            'coral-DecoratedTextfield',
            className
          )
        }
      >
        <Icon className="coral-DecoratedTextfield-icon" icon="search" size="S" />
        <Textfield
          ref="input"
          className="coral-DecoratedTextfield-input"
          value={ value }
          defaultValue={ defaultValue }
          disabled={ disabled }
          { ...otherProps }
          onKeyDown={ this.handleTextKeyDown }
          onChange={ this.handleTextChange }
        />
        {
          !emptyText &&
          <Button
            variant="minimal"
            icon="close"
            iconSize="XS"
            square
            className="coral-DecoratedTextfield-button"
            disabled={ disabled }
            onClick={ this.handleClearText }
          />
        }
      </div>
    );
  }
}
