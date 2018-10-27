import Checkbox from '../../Checkbox';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('card');
importSpectrumCSS('quickaction');

const formatMessage = messageFormatter(intlMessages);

export default class Card extends React.Component {
  static propTypes = {
    /** Whether or not the card supports selection */
    allowsSelection: PropTypes.bool,

    /** Whether or not the card is selected */
    selected: PropTypes.bool
  };

  static defaultProps = {
    selected: false,
    allowsSelection: true
  };

  render() {
    let {
      allowsSelection,
      children,
      className,
      selected,
      ...otherProps
    } = this.props;

    let checkbox = null;
    if (allowsSelection) {
      checkbox = (
        <div className="spectrum-QuickActions spectrum-Card-quickActions">
          <Checkbox
            checked={selected}
            title={formatMessage('select')} />
        </div>
      );
    }
    
    return (
      <div 
        {...filterDOMProps(otherProps)} 
        className={classNames('spectrum-Card', {'is-selected': selected}, className)}>
        {children}
        {checkbox}
      </div>
    );
  }
}
