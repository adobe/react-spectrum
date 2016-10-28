import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * selectedIndex: The index of the Tab that should be selected (open). When selectedIndex is
 * specified, the component is in a controlled state and a Tab can only be selected by changing the
 * selectedIndex prop value. By default, the first Tab will be selected.
 *
 * defaultSelectedIndex: The same as selectedIndex except that the component is in an uncontrolled
 * state.
 *
 * onChange: A function that will be called when an Tab is selected or deselected. It will be passed
 * the updated selected index.
 */
export default class TabList extends Component {
  constructor(props) {
    super(props);

    const {
      selectedIndex,
      defaultSelectedIndex,
      children
    } = props;

    let firstSelectedIndex;
    React.Children.forEach(children, (child, index) => {
      if (child.props.selected) {
        firstSelectedIndex = index;
      }
    });

    const defaultSelected = firstSelectedIndex || defaultSelectedIndex;

    const currentSelectedIndex = selectedIndex !== undefined ? selectedIndex : defaultSelected;
    this.state = {
      selectedIndex: currentSelectedIndex
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
  }

  onClickItem(selectedIndex) {
    this.setSelectedIndex(selectedIndex);
  }

  setSelectedIndex(selectedIndex) {
    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }

    this.props.onChange(selectedIndex);
  }

  getItems() {
    const selectedIndex = this.state.selectedIndex;
    const { children } = this.props;

    return React.Children.map(children, (child, index) => {
      const selected = +selectedIndex === index;

      const tabListOnClick = this.onClickItem.bind(this, index);
      const props = {
        selected,
        tabIndex: index,
        onClick: () => {
          if (child.props.onClick) { child.props.onClick(index); }
          tabListOnClick();
        }
      };

      return React.cloneElement(child, props);
    });
  }

  handleClickItem(selectedIndex) {
    this.setSelectedIndex(selectedIndex);
  }

  render() {
    const {
      className,
      size,
      orientation,
      ...otherProps
    } = this.props;

    delete otherProps.defaultSelectedIndex;
    delete otherProps.selectedIndex;

    // We don't need/want to add onChange to the div because we call it manually when we hear that
    // a tab has been clicked. If we were to add the handler to the div, it would be
    // called every time any input inside a tab is changed.
    delete otherProps.onChange;

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
      >
        { this.getItems() }
      </div>
    );
  }
}

TabList.defaultProps = {
  size: 'M',
  orientation: 'horizontal',
  defaultSelectedIndex: 0,
  onChange() {}
};

TabList.displayName = 'TabList';
