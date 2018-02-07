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
    layoutInfos: []
  };

  componentWillReceiveProps(nextProps) {
    if ('selectedIndex' in nextProps) {
      this.setState({
        selectedIndex: nextProps.selectedIndex
      });
    }
  }

  componentDidMount() {
    // Measure the tabs so we can position the line below correctly
    let layoutInfos = [];
    let tabs = ReactDOM.findDOMNode(this).querySelectorAll('.spectrum-TabList-item');
    for (let tab of tabs) {
      layoutInfos.push({
        left: tab.offsetLeft,
        top: tab.offsetTop,
        width: tab.offsetWidth,
        height: tab.offsetHeight
      });
    }

    this.setState({layoutInfos});
  }

  onChange(selectedIndex) {
    // If selectedIndex is defined on props then this is a controlled component and we shouldn't
    // change our own state.
    if (!('selectedIndex' in this.props)) {
      this.setState({
        selectedIndex
      });
    }
    
    if (this.props.onChange) {
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
      ...otherProps
    } = this.props;

    let selectedTab = this.state.layoutInfos[this.state.selectedIndex];

    return (
      <TabListBase
        orientation={orientation}
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
  let style = {
    transform: orientation === 'vertical'
      ? `translateY(${selectedTab.top}px)`
      : `translateX(${selectedTab.left}px) scaleX(${selectedTab.width})`
  };

  return <div className="spectrum-TabList-item-line" style={style} />;
}
