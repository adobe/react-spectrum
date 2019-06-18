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

import createId from '../../utils/createId';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Search from '../../Search';
import Select from '../../Select';

importSpectrumCSS('searchwithin');
require('../style/index.styl');

const formatMessage = messageFormatter(intlMessages);

/**
 * A SearchWithin component displays a dropdown next to a search input, typically
 * used to select the scope of a search.
 */
export default class SearchWithin extends React.Component {
  static propTypes = {
    /**
     * Scope options to be shown in the dropdown
     */
    scopeOptions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          label: PropTypes.string,
          value: PropTypes.string
        })
      ])
    ).isRequired,

    /**
     * The currently selected scope value (controlled).
     */
    scope: PropTypes.string,

    /**
     * The default selected scope value (uncontrolled).
     */
    defaultScope: PropTypes.string,

    /**
     * The current value of the textfield (controlled).
     */
    value: PropTypes.string,

    /**
     * The default value of the textfield (uncontrolled).
     */
    defaultValue: PropTypes.string,

    /**
     * A placeholder for the textfield.
     */
    placeholder: PropTypes.string,

    /**
     * Whether the field is disabled
     */
    disabled: PropTypes.bool,

    /**
     * A callback for when the field is submitted
     */
    onSubmit: PropTypes.func,

    /**
     * A callback for when the textfield changes.
     */
    onValueChange: PropTypes.func,

    /**
     * A callback for when the scope changes
     */
    onScopeChange: PropTypes.func
  };

  constructor(props) {
    super(props);

    const {scopeOptions} = props;

    // convert strings to <Select>'s expected label/value objects
    let newScopeOptions = scopeOptions.map(scope => typeof scope === 'string' ? {label: scope, value: scope} : scope);

    this.state = {scopeOptions: newScopeOptions};

    this.outerId = createId();
  }

  getChildId(childName) {
    return this.outerId + '-' + childName;
  }

  render() {
    const {
      scope,
      defaultScope,
      value,
      defaultValue,
      onScopeChange,
      onValueChange,
      onSubmit,
      disabled = false,
      placeholder = '',
      id = this.getChildId('search'),
      selectId = this.getChildId('select'),
      ...otherProps
    } = this.props;

    let ariaLabel = !otherProps['aria-labelledby'] ? formatMessage('Search within') : null;

    if (otherProps['aria-label']) {
      ariaLabel = otherProps['aria-label'];
      delete otherProps['aria-label'];
    }

    let ariaLabelledby = this.outerId;

    if (otherProps['aria-labelledby']) {
      if (ariaLabel) {
        ariaLabelledby = otherProps['aria-labelledby'] + ' ' + this.outerId;
      } else {
        ariaLabelledby = otherProps['aria-labelledby'];
      }
      delete otherProps['aria-labelledby'];
    }

    const selectProps = {};

    if (scope) {
      selectProps.value = scope;
    } else {
      selectProps.defaultValue = defaultScope ? defaultScope : this.state.scopeOptions[0].value;
    }

    const select = (
      <Select
        id={selectId}
        aria-labelledby={ariaLabelledby}
        onChange={onScopeChange}
        options={this.state.scopeOptions}
        disabled={disabled}
        required
        flexible
        {...selectProps} />
    );

    const searchProps = {};

    // comparison is on purpose, we don't want to mix undefined with null in equality
    if (value != null) {
      searchProps.value = value;
    } else if (defaultValue) {
      searchProps.defaultValue = defaultValue;
    }

    let search = (
      <Search
        id={id}
        aria-labelledby={selectId}
        placeholder={placeholder}
        onChange={onValueChange}
        onSubmit={onSubmit}
        disabled={disabled}
        role="presentation"
        {...searchProps} />
    );

    return (
      <div className="spectrum-SearchWithin react-spectrum-SearchWithin" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} id={this.outerId} role="search">
        {select}
        {search}
      </div>
    );
  }
}
