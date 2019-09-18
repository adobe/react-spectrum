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

import classNames from 'classnames';
import createId from '../../utils/createId';
import filterReactDomProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
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
    onScopeChange: PropTypes.func,

    /**
    * Class given to SearchWithin
    */
    className: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.outerId = createId();
  }

  getChildId(childName) {
    return this.outerId + '-' + childName;
  }

  render() {
    let {
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
      'aria-labelledby': ariaLabelledby,
      'aria-label': ariaLabel = (!ariaLabelledby ? formatMessage('Search within') : null),
      autoFocus,
      className,
      scopeOptions,
      ...otherProps
    } = this.props;

    let formattedScopeOptions = scopeOptions.map(scope => typeof scope === 'string' ? {label: scope, value: scope} : scope);

    if (ariaLabelledby) {
      if (ariaLabel) {
        ariaLabelledby += ` ${this.outerId}`;
      }
    } else {
      ariaLabelledby = this.outerId;
    }

    const selectProps = {};

    if (scope) {
      selectProps.value = scope;
    } else {
      selectProps.defaultValue = defaultScope ? defaultScope : formattedScopeOptions[0].value;
    }

    const select = (
      <Select
        id={selectId}
        aria-labelledby={ariaLabelledby}
        onChange={onScopeChange}
        options={formattedScopeOptions}
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
        aria-labelledby={ariaLabelledby + ` ${selectId}-value`}
        placeholder={placeholder}
        onChange={onValueChange}
        onSubmit={onSubmit}
        disabled={disabled}
        role="presentation"
        autoFocus={autoFocus}
        {...searchProps} />
    );

    return (
      <div
        className={
          classNames(
            'spectrum-SearchWithin',
            'react-spectrum-SearchWithin',
            className
          )
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        id={this.outerId}
        role="search"
        {...filterReactDomProps(otherProps)}>
        {select}
        {search}
      </div>
    );
  }
}
