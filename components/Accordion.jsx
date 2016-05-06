import React from 'react';
import classNames from 'classnames';

/**
 * selectedKey: The key of the AccordionItem that should be selected (open). If an AccordionItem
 * has not been given a key, its child index will be used as its key. If multiselectable is true,
 * selectedKey can be an array of keys. When selectedKey is specified, the component is in a
 * controlled state and an AccordionItem can only be selected by changing the selectedKey prop
 * value. By default, no AccordionItems will be selected.
 *
 * defaultSelectedKey: The same as selectedKey except that the component is in an uncontrolled
 * state. AccordionItems can be opened or closed without prop values having changed.
 *
 * multiselectable: Whether multiple AccordionItems can be selected (open) at the same time.
 *
 * onChange: A function that will be called when an AccordionItem is selected (opened) or
 * deselected (closed). It will be passed the updated selected key.
 */
export default class Accordion extends React.Component {
  constructor(props) {
    super(props);

    const {
      selectedKey,
      defaultSelectedKey
    } = props;

    let currentSelectedKey = selectedKey !== undefined ? selectedKey : defaultSelectedKey;

    this.state = {
      selectedKey: this.selectedKeyToArray(currentSelectedKey)
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedKey' in nextProps) {
      this.setState({
        selectedKey: this.selectedKeyToArray(nextProps.selectedKey)
      });
    }
  }

  selectedKeyToArray(selectedKey) {
    if (Array.isArray(selectedKey)) {
      return selectedKey;
    }

    return selectedKey ? [selectedKey] : [];
  }

  onClickItem(key) {
    let selectedKey = this.state.selectedKey;

    if (this.props.multiselectable) {
      selectedKey = [...selectedKey];
      const index = selectedKey.indexOf(key);
      const selected = index !== -1;
      if (selected) {
        // remove active state
        selectedKey.splice(index, 1);
      } else {
        selectedKey.push(key);
      }
    } else {
      selectedKey = selectedKey[0] === key ? [] : [key];
    }

    this.setSelectedKey(selectedKey);
  }

  setSelectedKey(selectedKey) {
    // If selectedKey is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedKey' in this.props)) {
      this.setState({
        selectedKey
      });
    }

    var deliverableSelectedKey = selectedKey;

    if (!this.props.multiselectable) {
      deliverableSelectedKey = selectedKey.length ? selectedKey[0] : null;
    }

    this.props.onChange(deliverableSelectedKey);
  }

  getItems() {
    const selectedKey = this.state.selectedKey;
    const { multiselectable, children } = this.props;
    return React.Children.map(children, (child, index) => {
      // If there is no key provide, use the index as default key
      const key = child.key || String(index);
      let selected = false;

      if (multiselectable) {
        selected = selectedKey.indexOf(key) !== -1;
      } else {
        selected = selectedKey[0] === key;
      }

      const props = {
        selected,
        onItemClick: this.onClickItem.bind(this, key)
      };

      return React.cloneElement(child, props)
    });
  }

  render() {
    const {
      className,
      multiselectable,
      ...rest
    } = this.props;

    return (
      <div
        { ...rest }
        className={
          classNames(
            'coral3-Accordion',
            className
          )
        }
        aria-multiselectable={multiselectable}
      >
        {this.getItems()}
      </div>
    );
  }
}

Accordion.defaultProps = {
  onChange() {},
  multiselectable: false
};
