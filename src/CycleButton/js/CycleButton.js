import Button from '../../Button';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../../utils/style/index.styl';

importSpectrumCSS('cyclebutton');

export default class CycleButton extends Component {
  static propTypes = {
    /**
     * Classes to be applied
     */
    className: PropTypes.string,

    /**
     * Contains options for actions
     */
    actions: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      icon: PropTypes.node,
      label: PropTypes.string
    })).isRequired,

    /**
     * Action used for controlled components.
     * This is used to match action.name
     */
    action: PropTypes.string,

    /**
    * Default action for unconrolled components
    */
    defaultAction: PropTypes.string,

    /**
     * Whether the CycleButton is disabled
     */
    disabled: PropTypes.bool,

    /**
     * Function called when CycleButton is clicked
     * Passes next action name from actions list in props
     */
    onChange: PropTypes.func,

    /**
     * Function called when CycleButton is clicked
     * Passes the current action name from actions list in props
     */
    onAction: PropTypes.func
  };

  static defaultProps = {
    onChange: function () {},
    disabled: false
  };

  constructor(props) {
    super(props);

    const {
      defaultAction,
      actions,
      action
    } = props;

    // if action prop is not passed in, uncontrolled component
    let newAction = action;
    if (!action) {
      if (defaultAction) {
        newAction = defaultAction;
      } else {
        // assign first element in actions array if no action or defaultAction were passed
        newAction = actions[0].name;
      }
    }

    this.state = {
      action: newAction,
      ariaBusy: false,
      ariaLive: 'off'
    };
  }

  componentDidMount() {
    this.setState({ariaLive: 'assertive'});
  }

  componentWillReceiveProps(props) {
    this.setActionState(props.action);
  }

  componentWillUnmount() {
    this.setState({ariaLive: 'off'});
  }

  setActionState(newAction) {
    if (newAction && newAction !== this.state.action) {
      this.setState({
        ariaBusy: true
      },
      () => this.setState({
        action: newAction
      },
      () => this.setState({
        ariaBusy: false
      })));
    }
  }

  getNextAction() {
    let currentActionIndex = this.props.actions.findIndex(e => e.name === this.state.action);

    let nextIndex = currentActionIndex + 1;
    let newAction;
    if (nextIndex < this.props.actions.length) {
      // set action to next element in actions array
      newAction = this.props.actions[nextIndex].name;
    } else {
      // circle back to first element in actions array
      newAction = this.props.actions[0].name;
    }

    return newAction;
  }

  handleChange = e => {
    const {onChange, onAction, action} = this.props;

    let newAction = this.getNextAction();

    if (onAction) {
      onAction(this.state.action, e);
    }

    if (!action) {
      // Only update state with next action if uncontrolled
      this.setActionState(newAction);
    }

    if (onChange) {
      // Call onChange only for controlled components to broadcast the next action
      onChange(newAction, e);
    }
  }

  render() {
    const {
      className,
      actions,
      ...otherProps
    } = this.props;

    const {
      action,
      ariaBusy,
      ariaLive
    } = this.state;

    let currentActionObj = actions.find(e => e.name === action);

    let icon, label;
    try {
      icon = currentActionObj.icon;
      label = currentActionObj.label;
    } catch (e) {
      throw 'Invalid Props';
    }

    // Don't let native browser change events bubble up to the root div.
    // Otherwise we double dispatch.
    delete otherProps.onChange;
    delete otherProps.action;

    return (
      <Button
        {...otherProps}
        variant="action"
        quiet
        className={classNames('spectrum-CycleButton', className)}
        onClick={this.handleChange}
        aria-live={ariaLive}
        aria-relevant="text"
        aria-atomic="true"
        aria-busy={ariaBusy}>
        <span className="u-react-spectrum-screenReaderOnly">{label}</span>
        {cloneIcon(icon, {size: 'S'})}
      </Button>
    );
  }
}

CycleButton.displayName = 'CycleButton';
