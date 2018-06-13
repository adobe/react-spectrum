import autobind from 'autobind-decorator';
import {interpretKeyboardEvent} from './events';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {removeDiacritics} from './string';
import scrollToDOMNode from './scrollToDOMNode';

const WHITESPACE_REGEXP = /[\n\r]+|[\s]{1,}/g;

@autobind
export default class FocusManager extends React.Component {
  static propTypes = {
    itemSelector: PropTypes.string.isRequired,
    manageTabIndex: PropTypes.bool,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    selectedItemSelector: PropTypes.string,
    disabled: PropTypes.bool,
    typeToSelect: PropTypes.bool
  };

  static defaultProps = {
    manageTabIndex: true,
    orientation: 'vertical',
    typeToSelect: false
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

  keysSoFar = '';
  keyClearTimeout = null;

  findItemToFocus(e) {
    const {
      target,
      shiftKey,
      charCode
    } = e;

    const character = removeDiacritics(String.fromCharCode(charCode)).toUpperCase();

    let items = this.getItems();

    if (this.keysSoFar === '' || character === this.keysSoFar || shiftKey) {
      // reverse order if shiftKey is pressed
      if (shiftKey) {
        items = items.reverse();
      }
      this.searchIndex = items.indexOf(target);
    }

    if (character !== this.keysSoFar) {
      this.keysSoFar += character;
    }

    this.clearKeysSoFarAfterDelay();

    let item = this.findMatchInRange(
      items,
      this.searchIndex + 1,
      items.length
    );

    if (!item) {
      item = this.findMatchInRange(
        items,
        0,
        this.searchIndex
      );
    }

    if (item) {
      item.focus();
    }
  }

  clearKeysSoFarAfterDelay() {
    if (this.keyClearTimeout) {
      clearTimeout(this.keyClearTimeout);
    }
    this.keyClearTimeout = setTimeout(() => this.keysSoFar = '', 500);
  }

  findMatchInRange(items, startIndex, endIndex) {
    // Find the first item starting with the keysSoFar substring, searching in the specified range of items
    for (let i = startIndex; i < endIndex; i++) {
      const label = items[i].innerText || items[i].textContent;
      if (label &&
          removeDiacritics(label)
          .replace(WHITESPACE_REGEXP, '')
          .toUpperCase()
          .indexOf(this.keysSoFar) === 0) {
        return items[i];
      }
    }
    return null;
  }

  /**
   * Handle keydown event
   * @param {Event} e Event object
   */
  onKeyDown(e) {
    interpretKeyboardEvent.call(this, e, this.props.orientation === 'horizontal');
  }

  /**
   * Handle keypress event
   * @param {Event} e Event object
   */
  onKeyPress(e) {
    this.findItemToFocus(e);
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
    const {
      children,
      disabled,
      manageTabIndex,
      typeToSelect
    } = this.props;
    return React.cloneElement(React.Children.only(children), {
      onKeyDown: !disabled ? this.onKeyDown : null,
      onKeyPress: typeToSelect && !disabled ? this.onKeyPress : null,
      onFocus: manageTabIndex && !disabled ? this.onFocus : null,
      onBlur: manageTabIndex && !disabled ? this.onBlur : null
    });
  }
}

const focusableElements = [
  'input:not([disabled]):not([type=hidden])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  'area[href]',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]'
];

export const FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join(',');

focusableElements.push('[tabindex]:not([tabindex="-1"])');

export const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([tabindex="-1"]),');

export function trapFocus(componentOrElement, event) {
  const {
    type,
    key,
    shiftKey,
    target
  } = event;

  let node;
  let tabbables;
  let tabbable;
  let first;
  let last;

  if (type === 'keydown' || type === 'focus') {
    node = ReactDOM.findDOMNode(componentOrElement);
    if (node) {
      // find tabbable elements within container element
      tabbables = Array.from(node.querySelectorAll(TABBABLE_ELEMENT_SELECTOR)).filter(el => el !== node);
      first = tabbables[0];
      last = tabbables[tabbables.length - 1];
    }
  }

  // If navigating using the tab key,
  if (type === 'keydown' && key === 'Tab') {
    if (node) {
      if (shiftKey) {
        // with focus on first tabbable element, navigating backwards,
        if (target === first) {
          // focus the last tabbable element
          tabbable = last;
        }
      // otherwise, with focus on last tabbable element, navigating forwards,
      } else if (target === last) {
        // focus the first tabbable element.
        tabbable = first;
      }
    }
  } else if (type === 'focus') {
    if (target === node) {
      tabbable = first;
    }
  }
  if (tabbable) {
    event.preventDefault();
    event.stopPropagation();
    tabbable.focus();
  }
}
