import autobind from 'autobind-decorator';
import {interpretKeyboardEvent} from './events';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import scrollToDOMNode from './scrollToDOMNode';

@autobind
export default class FocusManager extends React.Component {
  static propTypes = {
    itemSelector: PropTypes.string.isRequired,
    manageTabIndex: PropTypes.bool,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    selectedItemSelector: PropTypes.string,
    disabled: PropTypes.bool
  };

  static defaultProps = {
    manageTabIndex: true,
    orientation: 'vertical'
  };

  getItems(selected = false) {
    const {itemSelector, selectedItemSelector} = this.props;
    const selector = selected && selectedItemSelector ? selectedItemSelector : itemSelector;
    return Array.from(ReactDOM.findDOMNode(this).querySelectorAll(selector));
  }

  onFocusFirst(e) {
    const items = this.getItems();
    if (items.length && (!e || items.indexOf(e.target) !== -1)) {
      if (e) {
        e.preventDefault();
      }

      items[0].focus();
    }
  }

  onFocusLast(e) {
    const items = this.getItems();
    if (items.length && (!e || items.indexOf(e.target) !== -1)) {
      if (e) {
        e.preventDefault();
      }

      items[items.length - 1].focus();
    }
  }

  onFocusPrevious(e) {
    const items = this.getItems();
    if (items.length && e && items.indexOf(e.target) !== -1) {
      e.preventDefault();

      let index = items.indexOf(e.target) - 1;
      if (index < 0) {
        index = items.length - 1;
      }
      items[index].focus();
    }
  }

  onFocusNext(e) {
    const items = this.getItems();
    if (items.length && e && items.indexOf(e.target) !== -1) {
      e.preventDefault();

      let index = items.indexOf(e.target) + 1;
      if (index >= items.length) {
        index = 0;
      }
      items[index].focus();
    }
  }

  onPageUp(e) {
    const items = this.getItems();
    if (items.length && e && items.indexOf(e.target) !== -1) {
      e.preventDefault();

      const listNode = ReactDOM.findDOMNode(this);
      const nextPage = Math.max(e.target.offsetTop + e.target.offsetHeight - listNode.clientHeight, 0);
      const index = items.indexOf(e.target);
      const item = items.slice(0, index).reverse().find(item => item.offsetTop < nextPage);

      if (item) {
        item.focus();
        scrollToDOMNode(item, listNode, true);
      } else {
        this.onFocusFirst(e);
      }
    }
  }

  onPageDown(e) {
    const items = this.getItems();
    if (items.length && e && items.indexOf(e.target) !== -1) {
      e.preventDefault();

      const listNode = ReactDOM.findDOMNode(this);
      const nextPage = Math.min(e.target.offsetTop + listNode.clientHeight, listNode.scrollHeight + listNode.clientHeight);
      const index = items.indexOf(e.target) + 1;
      const item = items.slice(index).find(item => item.offsetTop + item.offsetHeight > nextPage);

      if (item) {
        item.focus();
        scrollToDOMNode(item, listNode, true);
      } else {
        this.onFocusLast(e);
      }
    }
  }

  /**
   * Handle keydown event
   * @param {Event} e Event object
   */
  onKeyDown(e) {
    interpretKeyboardEvent.call(this, e, this.props.orientation === 'horizontal');
  }

  /**
   * When an item receives focus, it should have tabIndex === 0 and all other items should have tabIndex === -1
   * @param {Event} e Event object
   */
  onFocus(e) {
    this.getItems().forEach(item => item.tabIndex = item === e.target ? 0 : -1);
  }

  /**
   * When an item loses focus, set the appropriate tabIndex on each item based on its selected state.
   * If the item losing focus is selected,
   * it should be the only item to receive focus on shift+tab or tab back to the control,
   * However, if the item losing focus is not selected,
   * any of the selected items should receive focus on shift+tab or tab.
   * @param {Event} e Event object
   */
  onBlur(e) {
    const selectedItems = this.getItems(true);

    // If there are selected items,
    if (selectedItems.length) {
      // store whether item losing focus is selected.
      const targetSelected = selectedItems.indexOf(e.target) !== -1;

      this.getItems().forEach(item => {

        // store whether the current item is selected.
        const selected = selectedItems.indexOf(item) !== -1;

        // If the current item is the item losing focus and it is selected,
        // or the current item is selected and the item losing focus is not selected,
        // set tabIndex === 0, otherwise set tabIndex === -1.
        item.tabIndex = (item === e.target && targetSelected) || (!targetSelected && selected) ? 0 : -1;
      });
    }
  }

  componentDidMount() {
    const {autoFocus, selectedItemSelector} = this.props;
    if (autoFocus) {
      const selectedItem = selectedItemSelector
        ? ReactDOM.findDOMNode(this).querySelector(selectedItemSelector)
        : null;

      // wait a frame before trying to shift focus
      requestAnimationFrame(() => {
        if (selectedItem) {
          selectedItem.focus();
        } else {
          this.onFocusFirst();
        }
      });
    }
  }

  render() {
    const {children, disabled, manageTabIndex} = this.props;
    return React.cloneElement(React.Children.only(children), {
      onKeyDown: !disabled ? this.onKeyDown : null,
      onFocus: manageTabIndex && !disabled ? this.onFocus : null,
      onBlur: manageTabIndex && !disabled ? this.onBlur : null
    });
  }
}
