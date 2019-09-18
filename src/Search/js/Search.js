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
import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import CrossSmall from '../../Icon/core/CrossSmall';
import intlMessages from '../intl/*.json';
import Magnifier from '../../Icon/core/Magnifier';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Textfield from '../../Textfield';

importSpectrumCSS('search');
const formatMessage = messageFormatter(intlMessages);

const normalizeValue = value => value || '';

@autobind
export default class Search extends Component {
  static propTypes = {
    /** Sets the search field value (controlled). */
    value: PropTypes.string,

    /** Sets the default search field value (uncontrolled). */
    defaultValue: PropTypes.string,

    /** Sets the icon displayed in the search field. Magnifier icon by default. */
    icon: PropTypes.node
  };

  static defaultProps = {
    icon: <Magnifier data-testid="searchicon" />,
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
      value: normalizeValue(value || defaultValue)
    };
  }

  componentWillReceiveProps(props) {
    if (normalizeValue(props.value) !== this.state.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleTextKeyDown(e) {
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
      this.handleTextChange('', e, 'escapeKey');
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  }

  handleTextChange(value, e, from = 'input') {
    const {onChange, disabled} = this.props;
    if (disabled || value === this.state.value) {
      return;
    }

    if (!('value' in this.props)) {
      this.setState({
        value
      });
    }

    onChange(value, e, {from});
  }

  handleClearButtonClick(e) {
    this.handleTextChange('', e, 'clearButton');
    // restore focus to the searchbox
    if (this.searchbox) {
      this.searchbox.focus();
    }
  }

  render() {
    const {
      disabled,
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
          type="search"
          role="searchbox"
          ref={s => this.searchbox = s}
          className="spectrum-Search-input"
          value={value}
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
