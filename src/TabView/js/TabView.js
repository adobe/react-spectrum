import {arraysEqual} from '../../utils/array';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import React from 'react';
import {TabList} from '../../TabList';
import '../style/index.styl';

@autobind
export default class TabView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: props.selectedIndex || 0
    };
  }

  componentWillReceiveProps(props) {
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
    let {className, orientation = 'horizontal', ...props} = this.props;

    let children = React.Children.map(this.props.children, c =>
      typeof c === 'object' && c ? React.cloneElement(c, {renderChildren: false}) : c
    );

    // Clone children so that they get componentWillReceiveProps when clicking on the same tab
    let selected = children[this.state.selectedIndex];
    let body = React.Children.map(selected.props.children, c =>
      typeof c === 'object' && c ? React.cloneElement(c) : c
    );

    return (
      <div className={classNames('react-spectrum-TabView', 'react-spectrum-TabView--' + orientation, className)}>
        <TabList
          {...props}
          orientation={orientation}
          selectedIndex={this.state.selectedIndex}
          onChange={this.onChange}>
          {children}
        </TabList>
        <div className="react-spectrum-TabView-body">
          {body}
        </div>
      </div>
    );
  }
}
