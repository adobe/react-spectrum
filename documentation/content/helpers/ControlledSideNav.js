import React from 'react';
import {SideNav} from '@react/react-spectrum/SideNav';

export default class ControlledSideNav extends React.Component {
  state = {
    value: this.props.defaultValue || this.props.value
  }
  onSelect(value, e) {
    if (this.props.onSelect) {
      this.props.onSelect(value, e);
    }
    this.setState({value});
  }
  render() {
    const {
      children,
      ...otherProps
    } = this.props;
    return <SideNav
             {...otherProps}
             value={this.state.value}
             onSelect={this.onSelect.bind(this)}>
      {children}
    </SideNav>;
  }
}
