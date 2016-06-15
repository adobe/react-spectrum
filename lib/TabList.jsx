import React from 'react';
import classNames from 'classnames';

/**
 * selectedKey: The key of the Tab that should be selected (open). If an TAb
 * has not been given a key, its child index will be used as its key. When selectedKey is specified,
 * the component is in a controlled state and an Tab can only be selected by changing the
 * selectedKey prop value. By default, the first Tab will be selected.
 *
 * defaultSelectedKey: The same as selectedKey except that the component is in an uncontrolled
 * state.
 *
 * onChange: A function that will be called when an Tab is selected or deselected. It will be passed
 * the updated selected key.
 */
export default class TabList extends React.Component {
  constructor(props) {
    super(props);

    const {
      selectedKey,
      defaultSelectedKey,
      children
    } = props;

    let firstSelectedItem;
    React.Children.forEach(children, (child) => {
      if (child.props.selected) {
        firstSelectedItem = child.key;
      }
    });

    const defaultSelected = firstSelectedItem || defaultSelectedKey;

    const currentSelectedKey = selectedKey !== undefined ? selectedKey : defaultSelected;
    this.state = {
      selectedKey: currentSelectedKey
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedKey' in nextProps) {
      this.setState({
        selectedKey: nextProps.selectedKey
      });
    }
  }

  setSelectedKey(selectedKey) {
    // If selectedKey is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedKey' in this.props)) {
      this.setState({
        selectedKey
      });
    }

    this.props.onChange(selectedKey);
  }

  getItems() {
    const selectedKey = this.state.selectedKey;
    const { children } = this.props;

    return React.Children.map(children, (child, index) => {
      // If there is no key provide, use the index as default key
      const key = child.key || String(index);
      const selected = String(selectedKey) === key;

      const tabListOnClick = this.onClickItem.bind(this, key);
      const props = {
        selected,
        tabIndex: index,
        onClick: () => {
          if (child.props.onClick) { child.props.onClick(key); }
          tabListOnClick();
        }
      };

      return React.cloneElement(child, props);
    });
  }

  handleClickItem(selectedKey) {
    this.setSelectedKey(selectedKey);
  }

  render() {
    const {
      className,
      size,
      orientation,
      ...otherProps
    } = this.props;

    return (
      <div
        { ...otherProps }
        className={
          classNames(
            'coral-TabList',
            size === 'L' ? 'coral-TabList--large' : '',
            orientation === 'vertical' ? 'coral-TabList--vertical' : '',
            className
          )
        }
        role="tablist"
        aria-multiselectable={ false }
      >
        { this.getItems() }
      </div>
    );
  }
}

TabList.defaultProps = {
  size: 'M',
  orientation: 'horizontal',
  defaultSelectedKey: '0',
  onChange() {}
};
