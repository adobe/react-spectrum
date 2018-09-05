import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager from '../../utils/FocusManager';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('menu');

const LIST_ITEM_SELECTOR = '.spectrum-Menu-item';
const NOT_DISABLED_SELECTOR = ':not(.is-disabled)';
const SELECTED_LIST_ITEM_SELECTOR = LIST_ITEM_SELECTOR + NOT_DISABLED_SELECTOR + '.is-selected';

export default class List extends Component {
  static propTypes = {
    className: PropTypes.string,
    role: PropTypes.string,
    selectable: PropTypes.bool,
    autoFocus: PropTypes.bool
  };

  static defaultProps = {
    role: 'listbox'
  };

  constructor(props) {
    super(props);
    this.listId = createId();
  }

  render() {
    const {
      className,
      children,
      role = 'listbox',
      autoFocus,
      selectable = false,
      id = this.listId,
      typeToSelect = true,
      ...otherProps
    } = this.props;

    return (
      <FocusManager itemSelector={LIST_ITEM_SELECTOR + NOT_DISABLED_SELECTOR} selectedItemSelector={SELECTED_LIST_ITEM_SELECTOR} typeToSelect={typeToSelect} autoFocus={autoFocus}>
        <ul
          id={id}
          className={
            classNames(
              'spectrum-Menu',
              {'is-selectable': selectable},
              className
            )
          }
          role={role}
          {...filterDOMProps(otherProps)}>
          {children}
        </ul>
      </FocusManager>
    );
  }
}
