import Button from '../../Button';
import classNames from 'classnames';
import Icon from '../../Icon';
import React, {Component} from 'react';
import Textfield from '../../Textfield';
import '../style/index.styl';

export default class Search extends Component {
  static defaultProps = {
    icon: 'search',
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
            'spectrum-DecoratedTextfield',
            {'is-disabled': disabled},
            className
          )
        }>
        <Textfield
          className={classNames('spectrum-Search-input', {'spectrum-DecoratedTextfield-input': icon})}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          {...otherProps}
          onKeyDown={this.handleTextKeyDown}
          onChange={this.handleTextChange} />
        {icon !== 'search'
          ? icon && <Icon className="spectrum-DecoratedTextfield-icon" icon={icon} size="S" />
          : <div className="spectrum-DecoratedTextfield-icon spectrum-Search-icon" />
        }
        {
          value !== '' &&
            <Button
              variant="icon"
              className="spectrum-Search-clear"
              disabled={disabled}
              onClick={this.handleClearButtonClick} />
        }
      </div>
    );
  }
}

Search.displayName = 'Search';
