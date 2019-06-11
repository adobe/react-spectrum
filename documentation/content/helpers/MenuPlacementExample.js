import Button from '@react/react-spectrum/Button';
import createId from '@react/react-spectrum/utils/createId';
import {Menu, MenuItem} from '@react/react-spectrum/Menu';
import OverlayTrigger from '@react/react-spectrum/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';

export default class MenuPlacementExample extends React.Component {
  static PLACEMENT_VALUES = [
    'bottom', 'bottom left', 'bottom right',
    'top', 'top left', 'top right',
    'left', 'left top', 'left bottom',
    'right', 'right top', 'right bottom'
  ];

  static propTypes = {
    defaultPlacement: PropTypes.oneOf(MenuPlacementExample.PLACEMENT_VALUES),
    placement: PropTypes.oneOf(MenuPlacementExample.PLACEMENT_VALUES)
  }

  static defaultProps = {
    defaultPlacement: 'bottom left'
  };

  state = {
    open: false,
    placement: this.props.placement || this.props.defaultPlacement
  }

  constructor(props) {
    super(props);
    this.id = createId();
  }

  componentWillReceiveProps(props) {
    if (props.defaultPlacement && props.defaultPlacement !== this.state.defaultPlacement) {
      this.setState({
        placement: props.defaultPlacement
      });
    }

    if (props.placement && props.placement !== this.state.placement) {
      this.setState({
        placement: props.placement
      });
    }
  }

  onOpen(e) {
    this.setState({open: true});
  }

  onClose(e) {
    this.setState({open: false});
  }

  onSelect(value) {
    this.setState({placement: value});
  }

  getMenuItems = (placement) => (
    MenuPlacementExample.PLACEMENT_VALUES.map(
      (value, index) => (
        <MenuItem
          key={index}
          role="menuitemradio"
          value={value}
          selected={placement === value || null}>
          {value}
        </MenuItem>
      )
    )
  );

  render() {
    const {id = this.id, label} = this.props;
    const {open, placement} = this.state;
    return (
      <OverlayTrigger
        closeOnSelect={false}
        flip={false}
        onShow={this.onOpen.bind(this)}
        onHide={this.onClose.bind(this)}
        placement={placement}
        style={{display: 'inline-block', overflow: 'auto'}}
        target={this}
        trigger="click">
        <Button
          aria-controls={open ? id : null}
          aria-haspopup="true"
          id={`${id}-trigger`}
          selected={open || null}
          variant="action">
          {`${label}: ${placement}`}
        </Button>
        <Menu
          aria-labelledby={`${id}-trigger`}
          autoFocus
          id={id}
          onSelect={this.onSelect.bind(this)}
          placement={placement}>
          {this.getMenuItems(placement)}
        </Menu>
      </OverlayTrigger>
    );
  }
}
