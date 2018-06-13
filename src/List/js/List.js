import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager from '../../utils/FocusManager';
import React, {Component} from 'react';
import '../style/index.styl';

importSpectrumCSS('selectlist');

const LIST_ITEM_SELECTOR = '.spectrum-SelectList-item';
const NOT_DISABLED_SELECTOR = ':not(.is-disabled)';
const SELECTED_LIST_ITEM_SELECTOR = LIST_ITEM_SELECTOR + NOT_DISABLED_SELECTOR + '.is-selected';

export default class List extends Component {
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
              'spectrum-SelectList',
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
