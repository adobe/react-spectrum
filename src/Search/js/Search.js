import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import CrossSmall from '../../Icon/core/CrossSmall';
import Magnifier from '../../Icon/core/Magnifier';
import React, {Component} from 'react';
import Textfield from '../../Textfield';

importSpectrumCSS('search');

export default class Search extends Component {
  static defaultProps = {
    icon: <Magnifier />,
    onChange: function () {},
    onSubmit: function () {}
  };

  constructor(props) {
    super(props);

    const {
      value,
      defaultValue
    } = props;

    this.state = {
      value: value || defaultValue || ''
    };
  }

  handleTextKeyDown = e => {
    const {onSubmit, onKeyDown, disabled} = this.props;
    const {value} = this.state;
    const key = e.which;

    if (key === 13 || key === 27) {
      e.preventDefault();
    }

    if (key === 13 && !disabled) {
      onSubmit(value);
    }

    if (key === 27 && !disabled) {
      this.clearText(e, 'escapeKey');
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  }

  handleTextChange = (value, e) => {
    const {onChange} = this.props;

    this.setState({
      value
    });
    onChange(value, e, {from: 'input'});
  }

  handleClearButtonClick = e => {
    this.clearText(e, 'clearButton');
  }

  clearText = (e, from) => {
    const {onChange, disabled} = this.props;

    if (disabled || this.state.value === '') {
      return;
    }

    if (!('value' in this.props)) {
      this.setState({
        value: ''
      });
    }

    onChange('', e, {from});
  }

  render() {
    const {
      disabled,
      defaultValue,
      className,
      icon,
      ...otherProps
    } = this.props;
    const {value} = this.state;

    return (
      <div
        className={
          classNames(
            'spectrum-Search',
            {'is-disabled': disabled},
            className
          )
        }>
        <Textfield
          className="spectrum-Search-input"
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          {...otherProps}
          onKeyDown={this.handleTextKeyDown}
          onChange={this.handleTextChange} />
        {cloneIcon(icon, {className: 'spectrum-Search-icon', size: 'S'})}
        {
          value !== '' &&
            <Button
              variant="clear"
              icon={<CrossSmall />}
              disabled={disabled}
              onClick={this.handleClearButtonClick} />
        }
      </div>
    );
  }
}

Search.displayName = 'Search';
