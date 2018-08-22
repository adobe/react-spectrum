import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import CrossSmall from '../../Icon/core/CrossSmall';
import intlMessages from '../intl/*.json';
import Magnifier from '../../Icon/core/Magnifier';
import {messageFormatter} from '../../utils/intl';
import React, {Component} from 'react';
import Textfield from '../../Textfield';

importSpectrumCSS('search');
const formatMessage = messageFormatter(intlMessages);

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

    if (disabled) {
      return;
    }

    if (key === 13) {
      onSubmit(value);
    }

    if (key === 27) {
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

    // restore focus to the searchbox
    if (this.searchbox) {
      this.searchbox.focus();
    }
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
      role = 'search',
      ...otherProps
    } = this.props;
    const {value} = this.state;

    return (
      <div
        role={role}
        className={
          classNames(
            'spectrum-Search',
            {'is-disabled': disabled},
            className
          )
        }>
        <Textfield
          role="searchbox"
          ref={s => this.searchbox = s}
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
              aria-label={formatMessage('Clear search')}
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
