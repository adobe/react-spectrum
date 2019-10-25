/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {arraysEqual} from '../../utils/array';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import createId from '../../utils/createId';
import PropTypes from 'prop-types';
import React from 'react';
import {TabList} from '../../TabList';
import TabListBase from '../../TabList/js/TabListBase';
import '../style/index.styl';

@convertUnsafeMethod
@autobind
export default class TabView extends React.Component {
  static propTypes = {
    /** Class to add to the tab view */
    className: PropTypes.string,

    /** Id for tab view */
    id: PropTypes.string,

    /** Function called when a tab is selected */
    onSelect: PropTypes.func,

    /** Tab orientation */
    orientation: PropTypes.oneOf(['vertical', 'horizontal']),

    /**
     * The index of the Tab that should be selected (open). When selectedIndex is
     * specified, the component is in a controlled state and a Tab can only be selected by changing the
     * selectedIndex prop value. By default, the first Tab will be selected.
     */
    selectedIndex: PropTypes.number,

    /**
     * The same as selectedIndex except that the component is in an uncontrolled state.
     */
    defaultSelectedIndex: PropTypes.number,

    /** Children are required */
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    id: createId(),
    orientation: 'horizontal'
  };

  constructor(props) {
    super(props);
    this.tabViewId = createId();
    this.state = {
      selectedIndex: TabListBase.getDefaultSelectedIndex(props)
    };
  }

  UNSAFE_componentWillReceiveProps(props) {
    // Reset selected index when children change
    let oldChildren = React.Children.toArray(this.props.children).map(child => child.key);
    let newChildren = React.Children.toArray(props.children).map(child => child.key);

    if (props.selectedIndex !== this.props.selectedIndex || !arraysEqual(oldChildren, newChildren)) {
      this.setState({
        selectedIndex: props.selectedIndex || 0
      });
    }
  }

  onChange(selectedIndex) {
    if (this.props.selectedIndex == null) {
      this.setState({selectedIndex});
    }

    if (this.props.onSelect) {
      this.props.onSelect(selectedIndex);
    }
  }

  render() {
    let {
      className,
      id = this.tabViewId,
      orientation,
      ...props
    } = this.props;

    const tabId = id + '-tab';
    const tabPanelId = id + '-tabpanel';

    let children = React.Children.map(this.props.children, (c, i) =>
      typeof c === 'object' && c ? React.cloneElement(c, {
        'aria-controls': tabPanelId,
        id: tabId + '-' + i,
        renderChildren: false
      }) : c
    );

    // Clone children so that they get componentWillReceiveProps when clicking on the same tab
    let selected = children[this.state.selectedIndex];
    let body = React.Children.map(selected.props.children, c =>
      typeof c === 'object' && c ? React.cloneElement(c) : c
    );

    return (
      <div
        className={classNames('react-spectrum-TabView', 'react-spectrum-TabView--' + orientation, className)}>
        <TabList
          {...props}
          orientation={orientation}
          selectedIndex={this.state.selectedIndex}
          onChange={this.onChange}>
          {children}
        </TabList>
        <div className="react-spectrum-TabView-body" role="tabpanel" id={tabPanelId} aria-labelledby={selected.props.id} >
          {body}
        </div>
      </div>
    );
  }
}
