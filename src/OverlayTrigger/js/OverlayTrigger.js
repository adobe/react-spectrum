import React, {Component, PropTypes} from 'react';
import TetherDropComponent from '../../internal/TetherDropComponent';
import {getTetherPositionFromPlacement} from '../../utils/tether';

export default class OverlayTrigger extends Component {
  static propTypes = {
    overlay: PropTypes.node,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    placement: PropTypes.string
  };

  static defaultProps = {
    overlay: null,
    children: null,
    attachmentConstraints: {
      to: 'window',
      attachment: 'together'
    },
    placement: 'left'
  };

  constructor(props) {
    super(props);
    this.state = {open: false};

  }

  triggerOverlay() {
    if (this.state.open) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  show() {
    this.setState({open: true});
  }
  
  hide() {
    this.setState({open: false});
  }

  render() {
    let children = React.cloneElement(React.Children.only(this.props.children), {onClick: this.triggerOverlay.bind(this)});
    return (
      <TetherDropComponent
        ref="drop"
        position={getTetherPositionFromPlacement(this.props.placement)}
        open={this.state.open}
        classPrefix="coral-Popover-drop"
        constraints={this.props.attachmentConstraints}
        content={this.props.overlay}
        onClickOutside={this.state.open ? this.hide.bind(this) : null}>
        {children}
      </TetherDropComponent>
    );
  }
}

OverlayTrigger.displayName = 'OverlayTrigger';
