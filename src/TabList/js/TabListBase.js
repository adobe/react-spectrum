import autobind from 'autobind-decorator';
import FocusManager from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const TAB_ITEM_SELECTOR = '[role=tab]:not([aria-disabled])';
const TAB_ITEM_SELECTED_SELECTOR = TAB_ITEM_SELECTOR + '[aria-selected=true]';

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
 * @private
 */
@focusRing
export default class TabListBase extends Component {
  state = {
    selectedIndex: TabListBase.getDefaultSelectedIndex(this.props)
  };

  static getDefaultSelectedIndex(props) {
    if (props.selectedIndex != null) {
      return props.selectedIndex;
    }

    if (props.defaultSelectedIndex != null) {
      return props.defaultSelectedIndex;
    }

    let firstSelected = React.Children.toArray(props.children).findIndex(c => c && c.props.selected);
    if (firstSelected !== -1) {
      return firstSelected;
    }

    return 0;
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
  }

  onClickItem(selectedIndex, e) {
    this.setSelectedIndex(selectedIndex, e);
  }

  onFocus(selectedIndex, e) {
    if (this.props.keyboardActivation === 'automatic' && !this.isMouseDown) {
      this.setSelectedIndex(selectedIndex, e);
    }
  }

  onMouseDown(e) {
    this.isMouseDown = true;
    window.addEventListener('mouseup', this.onMouseUp);

    // ensure Tab receives keyboard focus in Safari
    e.currentTarget.focus();
  }

  @autobind
  onMouseUp(e) {
    this.isMouseDown = false;
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  setSelectedIndex(selectedIndex, e) {
    const lastSelectedIndex = this.state.selectedIndex;

    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }

    if (lastSelectedIndex !== selectedIndex) {
      this.props.onChange(selectedIndex);
    }
  }

  getChildProps(child, index) {
    const selectedIndex = this.state.selectedIndex;
    const selected = +selectedIndex === index;

    return {
      ...this.getMappedChildProps(child, index),
      selected,
      tabIndex: (selected ? 0 : -1),
      onClick: this.getChildOnClick(child, index),
      onFocus: this.getChildOnFocus(child, index),
      onMouseDown: this.getChildOnMouseDown(child)
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
    return (e) => {
      if (child.props.onClick) {child.props.onClick(index); }
      tabListOnClick(e);
    };
  }

  getChildOnFocus(child, index) {
    if (this.props.disabled) {
      return null;
    }
    return (e) => {
      if (child.props.onFocus) {
        child.props.onFocus(index);
      }
      this.onFocus(index, e);
    };
  }

  getChildOnMouseDown(child, index) {
    if (this.props.disabled) {
      return null;
    }
    return (e) => {
      if (child.props.onMouseDown) {
        child.props.onMouseDown(e);
      }
      this.onMouseDown(e);
    };
  }

  getItems() {
    const {children} = this.props;
    return React.Children.toArray(children).map((child, index) =>
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
    delete otherProps.keyboardActivation;

    // div element should have aria-orientation rather than orientation
    otherProps['aria-orientation'] = otherProps.orientation;
    delete otherProps.orientation;

    return otherProps;
  }

  render() {
    return (
      <FocusManager itemSelector={TAB_ITEM_SELECTOR} selectedItemSelector={TAB_ITEM_SELECTED_SELECTOR} orientation={this.props.orientation}>
        <div
          {...this.cleanProps()}
          role="tablist">
          {this.getItems()}
        </div>
      </FocusManager>
    );
  }
}

TabListBase.propTypes = {
  defaultSelectedIndex: PropTypes.number,
  disabled: PropTypes.bool,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  keyboardActivation: PropTypes.oneOf(['automatic', 'manual']),
  onChange() {}
};

TabListBase.defaultProps = {
  defaultSelectedIndex: 0,
  disabled: false,
  orientation: 'horizontal',
  keyboardActivation: 'automatic',
  onChange() {}
};

TabListBase.displayName = 'TabListBase';
