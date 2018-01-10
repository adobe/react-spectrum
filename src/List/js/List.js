import classNames from 'classnames';
import FocusManager from '../../utils/FocusManager';
import React, {Component} from 'react';
import '../style/index.styl';

const LIST_ITEM_SELECTOR = '.spectrum-SelectList-item:not(.is-disabled)';
const SELECTED_LIST_ITEM_SELECTOR = LIST_ITEM_SELECTOR + '.is-selected';

export default class List extends Component {
  render() {
    const {
      className,
      children,
      role = 'listbox',
      autoFocus,
      ...otherProps
    } = this.props;

    return (
      <FocusManager itemSelector={LIST_ITEM_SELECTOR} selectedItemSelector={SELECTED_LIST_ITEM_SELECTOR} autoFocus={autoFocus}>
        <ul
          className={
            classNames(
              'spectrum-SelectList',
              className
            )
          }
          role={role}
          {...otherProps}>
          {children}
        </ul>
      </FocusManager>
    );
  }
}
