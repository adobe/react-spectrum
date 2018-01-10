import classNames from 'classnames';
import FocusManager from '../../utils/FocusManager';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

/**
 * selectedIndex: The index of the AccordionItem that should be selected (open). If multiselectable
 * is true, selectedIndex can be an array of indices. When selectedIndex is specified, the component
 * is in a controlled state and an AccordionItem can only be selected by changing the selectedIndex
 * prop value. By default, no AccordionItems will be selected.
 *
 * defaultSelectedIndex: The same as selectedIndex except that the component is in an uncontrolled
 * state. AccordionItems can be opened or closed without prop values having changed.
 *
 * multiselectable: Whether multiple AccordionItems can be selected (open) at the same time.
 *
 * onChange: A function that will be called when an AccordionItem is selected (opened) or
 * deselected (closed). It will be passed the updated selected index.
 */

const ACCORDION_ITEM_HEADER_SELECTOR = '.spectrum-Accordion-item:not(.is-disabled) > .spectrum-Accordion-header';

export default class Accordion extends Component {
  constructor(props) {
    super(props);

    const {
      selectedIndex,
      defaultSelectedIndex
    } = props;

    const currentSelectedIndex = selectedIndex !== undefined ? selectedIndex : defaultSelectedIndex;

    this.state = {
      selectedIndex: this.normalizeSelectedIndex(currentSelectedIndex)
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: this.normalizeSelectedIndex(nextProps.selectedIndex)
      });
    }
  }

  onClickItem(index) {
    let selectedIndex = this.state.selectedIndex;

    if (this.props.multiselectable) {
      selectedIndex = [...selectedIndex];

      const i = selectedIndex.indexOf(index);
      const selected = i !== -1;

      if (selected) {
        selectedIndex.splice(i, 1);
      } else {
        selectedIndex.push(index);
      }
    } else {
      selectedIndex = selectedIndex[0] === index ? [] : [index];
    }

    this.setSelectedKey(selectedIndex);
  }

  setSelectedKey(selectedIndex) {
    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }

    let deliverableSelectedIndex = selectedIndex;

    if (!this.props.multiselectable) {
      deliverableSelectedIndex = selectedIndex.length ? selectedIndex[0] : null;
    }

    this.props.onChange(deliverableSelectedIndex);
  }

  getItems() {
    const selectedIndex = this.state.selectedIndex;
    const {multiselectable, ariaLevel, children} = this.props;
    return React.Children.map(children, (child, index) => {
      const selected = multiselectable
        ? selectedIndex.indexOf(index) !== -1
        : selectedIndex[0] === index;

      const props = {
        itemRef: child,
        selected,
        ariaLevel: ariaLevel,
        onItemClick: this.onClickItem.bind(this, index)
      };

      return React.cloneElement(child, props);
    });
  }

  normalizeSelectedIndex(selectedIndex) {
    if (!Array.isArray(selectedIndex)) {
      selectedIndex = selectedIndex !== undefined ? [selectedIndex] : [];
    }

    return selectedIndex.map(index => parseInt(index, 10));
  }

  render() {
    const {
      className,
      multiselectable,
      ...otherProps
    } = this.props;

    // Prevent defaultSelectedIndex and selectedIndex from getting passed to div and causing a
    // warning.
    delete otherProps.selectedIndex;
    delete otherProps.defaultSelectedIndex;
    delete otherProps.ariaLevel;

    // We don't need/want to add onChange to the div because we call it manually when we hear that
    // an accordion item has been clicked. If we were to add the handler to the div, it would be
    // called every time any input inside the accordion is changed.
    delete otherProps.onChange;

    return (
      <FocusManager itemSelector={ACCORDION_ITEM_HEADER_SELECTOR}>
        <div
          {...otherProps}
          className={
            classNames(
              'spectrum-Accordion',
              className
            )
          }
          role="tablist"
          aria-orientation="vertical"
          aria-multiselectable={multiselectable}>
          {this.getItems()}
        </div>
      </FocusManager>
    );
  }
}

Accordion.displayName = 'Accordion';

Accordion.propTypes = {
  onChange() {},
  multiselectable: PropTypes.bool,
  ariaLevel: PropTypes.number
};

Accordion.defaultProps = {
  onChange() {},
  multiselectable: false,
  ariaLevel: 3
};
