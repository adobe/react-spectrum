import autobind from 'autobind-decorator';
import {interpretKeyboardEvent} from './events';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

@autobind
export default class FocusManager extends React.Component {
  static propTypes = {
    itemSelector: PropTypes.string.isRequired,
    selectedItemSelector: PropTypes.string,
    disabled: PropTypes.bool
  };

  getItems() {
    return Array.from(ReactDOM.findDOMNode(this).querySelectorAll(this.props.itemSelector));
  }

  onFocusFirst(e) {
    const items = this.getItems();
    if (items.length) {
      if (e) {
        e.preventDefault();
      }

      items[0].focus();
    }
  }

  onFocusLast(e) {
    const items = this.getItems();
    if (items.length) {
      if (e) {
        e.preventDefault();
      }

      items[items.length - 1].focus();
    }
  }

  onFocusPrevious(e) {
    const items = this.getItems();
    if (items.length) {
      if (e) {
        e.preventDefault();
      }

      let index = items.indexOf(e.target) - 1;
      if (index < 0) {
        index = items.length - 1;
      }
      items[index].focus();
    }
  }

  onFocusNext(e) {
    const items = this.getItems();
    if (items.length) {
      if (e) {
        e.preventDefault();
      }

      let index = items.indexOf(e.target) + 1;
      if (index >= items.length) {
        index = 0;
      }
      items[index].focus();
    }
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      const selected = this.props.selectedItemSelector
        ? ReactDOM.findDOMNode(this).querySelector(this.props.selectedItemSelector)
        : null;

      if (selected) {
        selected.focus();
      } else {
        this.onFocusFirst();
      }
    }
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children), {
      onKeyDown: this.props.disabled ? null : interpretKeyboardEvent.bind(this)
    });
  }
}
