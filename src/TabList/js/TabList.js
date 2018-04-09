import autobind from 'autobind-decorator';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import TabListBase from './TabListBase';
import '../style/index.styl';

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
@autobind
export default class TabList extends React.Component {
  state = {
    selectedIndex: TabListBase.getDefaultSelectedIndex(this.props),
    tabArray: []
  };

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
  }

  componentDidMount() {
    this.updateTabs();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.updateTabs();
    }
  }

  updateTabs() {
    // Measure the tabs so we can position the line below correctly
    const tabArray = ReactDOM.findDOMNode(this).querySelectorAll('.spectrum-TabList-item');
    this.setState({tabArray});
  }

  onChange(selectedIndex) {
    var lastSelectedIndex = this.state.selectedIndex;

    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }
    if (lastSelectedIndex !== selectedIndex && this.props.onChange) {
      this.props.onChange(selectedIndex);
    }
  }

  render() {
    const {
      className,
      size = 'M',
      orientation = 'horizontal',
      variant = 'panel',
      children,
      defaultSelectedIndex,
      ...otherProps
    } = this.props;

    const {
      selectedIndex,
      tabArray
    } = this.state;

    let selectedTab = tabArray[selectedIndex];

    return (
      <TabListBase
        orientation={orientation}
        defaultSelectedIndex={defaultSelectedIndex || null}
        selectedIndex={selectedIndex}
        {...otherProps}
        className={classNames(
          'spectrum-TabList',
          size === 'L' ? 'spectrum-TabList--large' : '',
          `spectrum-TabList--${orientation}`,
          `spectrum-TabList--${variant}`,
          className
        )}
        onChange={this.onChange}>
        {children}
        {selectedTab &&
          <TabLine orientation={orientation} selectedTab={selectedTab} />
        }
      </TabListBase>
    );
  }
}

function TabLine({orientation, selectedTab}) {
  const style = {
    transform: orientation === 'vertical'
      ? `translateY(${selectedTab.offsetTop}px)`
      : `translateX(${selectedTab.offsetLeft}px) `
  };

  if (orientation === 'horizontal') {
    style.width = `${selectedTab.offsetWidth}px`;
  }

  return <div className="spectrum-TabList-item-line" role="presentation" style={style} />;
}
