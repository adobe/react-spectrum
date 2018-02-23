import classNames from 'classnames';
import createId from '../../utils/createId';
import FocusManager from '../../utils/FocusManager';
import React, {Component} from 'react';
import '../style/index.styl';

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
      ...otherProps
    } = this.props;

    delete otherProps.arrowOffsetLeft;
    delete otherProps.arrowOffsetTop;
    delete otherProps.arrowStyle;
    delete otherProps.crossOffset;
    delete otherProps.dropdownMenu;
    delete otherProps.positionLeft;
    delete otherProps.positionTop;
    delete otherProps.maxHeight;

    return (
      <FocusManager itemSelector={LIST_ITEM_SELECTOR + NOT_DISABLED_SELECTOR} selectedItemSelector={SELECTED_LIST_ITEM_SELECTOR} autoFocus={autoFocus}>
        <ul
          id={id}
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
