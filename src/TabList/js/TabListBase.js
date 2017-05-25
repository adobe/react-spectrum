import React, {Component} from 'react';

/**
 * selectedIndex: The index of the StepList that should be selected. When selectedIndex is
 * specified, the component is in a controlled state and a Step can only be selected by changing the
 * selectedIndex prop value. By default, the first Step will be selected.
 *
 * defaultSelectedIndex: The same as selectedIndex except that the component is in an uncontrolled
 * state.
 *
 * onChange: A function that will be called when an Step is selected or deselected.
 * It will be passed the updated selected index.
 *
 * childMappingFunction: allows you to map additional properties for each tab child
 */
export default class TabListBase extends Component {
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

  getChildProps(child, index) {
    const selectedIndex = this.state.selectedIndex;
    const selected = +selectedIndex === index;

    return {
      ...this.getMappedChildProps(child, index),
      selected,
      tabIndex: index,
      onClick: this.getChildOnClick(child, index)
    };
  }

  getMappedChildProps(child, index) {
    const {childMappingFunction} = this.props;
    if (!childMappingFunction) { return {}; }
    return childMappingFunction(this, child, index);
  }

  getChildOnClick(child, index) {
    if (this.props.disabled) { return null; }
    const tabListOnClick = this.onClickItem.bind(this, index);
    return () => {
      if (child.props.onClick) { child.props.onClick(index); }
      tabListOnClick();
    };
  }

  getItems() {
    const {children} = this.props;
    return React.Children.map(children, (child, index) =>
      child ? React.cloneElement(child, this.getChildProps(child, index)) : null
    );
  }

  cleanProps() {
    const {...otherProps} = this.props;
    delete otherProps.defaultSelectedIndex;
    delete otherProps.selectedIndex;

    // We don't need/want to add onChange to the div because we call it manually when we hear that
    // a tab has been clicked. If we were to add the handler to the div, it would be
    // called every time any input inside a tab is changed.
    delete otherProps.onChange;
    delete otherProps.disabled;
    delete otherProps.childMappingFunction;
    return otherProps;
  }

  render() {
    return (
      <div
        { ...this.cleanProps() }
        role="tablist"
      >
        { this.getItems() }
      </div>
    );
  }
}

TabListBase.defaultProps = {
  defaultSelectedIndex: 0,
  disabled: false,
  onChange() {}
};

TabListBase.displayName = 'TabListBase';
