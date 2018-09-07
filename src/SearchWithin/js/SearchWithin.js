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

export default class SearchWithin extends React.Component {
  static propTypes = {
    scopeOptions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          label: PropTypes.string,
          value: PropTypes.string
        })
      ])
    ).isRequired,
    scope: PropTypes.string,
    defaultScope: PropTypes.string,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    onSubmit: PropTypes.func,
    onValueChange: PropTypes.func,
    onScopeChange: PropTypes.func,
    ariaLabel: PropTypes.string
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

    if (value) {
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
