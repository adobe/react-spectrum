import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('menu');

const LIST_ITEM_SELECTOR = '.spectrum-Menu-item';
const NOT_DISABLED_SELECTOR = ':not(.is-disabled)';
const SELECTED_LIST_ITEM_SELECTOR = LIST_ITEM_SELECTOR + NOT_DISABLED_SELECTOR + '.is-selected';

@focusRing
export default class List extends Component {
  static propTypes = {
    /**
     * Focus should immediately be given to the list upon render, specifically
     * the currently selected item
     */
    autoFocus: PropTypes.bool,

    /**
     * Class added to this component
     */
    className: PropTypes.string,

    /**
     * The WAI-ARIA role for the list. Defaults to "listbox", but could be "menu" depending on context.
     */
    role: PropTypes.oneOf(['listbox', 'menu']),

    /**
     * Whether or not the list supports selection.
     */
    selectable: PropTypes.bool,

    /**
     * Whether to include alphanumeric typing as a way to move focus to items in a list.
     */
    typeToSelect: PropTypes.bool
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
