import classNames from 'classnames';
import React, {Component} from 'react';
import '../style/index.styl';

const LIST_ITEM_SELECTOR = '.coral-BasicList-item:not(.is-disabled)';
const SELECTED_LIST_ITEM_SELECTOR = LIST_ITEM_SELECTOR + '.is-selected';

export default class List extends Component {
  getItems() {
    return Array.from(this.list.querySelectorAll(LIST_ITEM_SELECTOR));
  }

  handleFocusFirst = () => {
    this.getItems()[0].focus();
  }

  handleFocusLast = () => {
    const items = this.getItems();
    items[items.length - 1].focus();
  }

  handleFocusPrevious = e => {
    const items = this.getItems();
    let index = items.indexOf(e.target) - 1;
    if (index < 0) {
      index = items.length - 1;
    }
    items[index].focus();
  }

  handleFocusNext = e => {
    const items = this.getItems();
    let index = items.indexOf(e.target) + 1;
    if (index >= items.length) {
      index = 0;
    }
    items[index].focus();
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      const selected = this.list.querySelector(SELECTED_LIST_ITEM_SELECTOR);
      if (selected) {
        selected.focus();
      } else {
        this.handleFocusFirst();
      }
    }
  }

  render() {
    const {
      className,
      children,
      role = 'listbox',
      ...otherProps
    } = this.props;

    return (
      <ul
        ref={l => this.list = l}
        className={
          classNames(
            'coral-BasicList',
            className
          )
        }
        role={role}
        {...otherProps}
      >
        {React.Children.map(children, child => (
          React.cloneElement(child, {
            onFocusNext: this.handleFocusNext,
            onFocusPrevious: this.handleFocusPrevious,
            onFocusFirst: this.handleFocusFirst,
            onFocusLast: this.handleFocusLast
          })
        ))}
      </ul>
    );
  }
}
