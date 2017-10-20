import autobind from 'autobind-decorator';
import calculatePosition from './calculatePosition';
import classNames from 'classnames';
import getContainer from 'react-overlays/lib/utils/getContainer';
import ownerDocument from 'react-overlays/lib/utils/ownerDocument';
import React, {cloneElement} from 'react';
import ReactDOM from 'react-dom';

/**
 * The Position component calculates the coordinates for its child, to position
 * it relative to a `target` component or node. Useful for creating callouts
 * and tooltips, the Position component injects a `style` props with `left` and
 * `top` values for positioning your component.
 *
 * It also injects "arrow" `left`, and `top` values for styling callout arrows
 * for giving your components a sense of directionality.
 */
@autobind
export default class Position extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      positionLeft: 0,
      positionTop: 0,
      arrowOffsetLeft: null,
      arrowOffsetTop: null
    };

    this._needsFlush = false;
    this._lastTarget = null;
  }

  static defaultProps = {
    containerPadding: 10
  }

  componentDidMount() {
    this.updatePosition(this.getTarget());
    window.addEventListener('resize', this.maybeUpdatePosition, false);
  }

  componentWillReceiveProps() {
    this._needsFlush = true;
  }

  componentDidUpdate(prevProps) {
    if (this._needsFlush) {
      this._needsFlush = false;
      this.maybeUpdatePosition(this.props.placement !== prevProps.placement);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.maybeUpdatePosition, false);
  }

  render() {
    const {children, className, ...props} = this.props;
    const {positionLeft, positionTop, maxHeight, arrowOffsetLeft, arrowOffsetTop} = this.state;

    // These should not be forwarded to the child.
    delete props.target;
    delete props.container;
    delete props.containerPadding;
    delete props.shouldUpdatePosition;

    const child = React.Children.only(children);
    return cloneElement(
      child,
      {
        ...props,
        arrowOffsetLeft,
        arrowOffsetTop,
        positionLeft,
        positionTop,
        className: classNames(className, child.props.className),
        arrowStyle: {
          left: arrowOffsetLeft,
          top: arrowOffsetTop
        },
        style: {
          ...child.props.style,
          position: 'absolute',
          zIndex: 100000, // should match the z-index in ModalTrigger
          left: positionLeft,
          top: positionTop,
          maxHeight: maxHeight
        }
      }
    );
  }

  getTarget() {
    const target = this.props.target;
    const targetElement = typeof target === 'function' ? target() : target;
    return targetElement && ReactDOM.findDOMNode(targetElement) || null;
  }

  maybeUpdatePosition(placementChanged) {
    const target = this.getTarget();

    if (
      !this.props.shouldUpdatePosition &&
      target === this._lastTarget &&
      !placementChanged
    ) {
      return;
    }

    this.updatePosition(target);
  }

  updatePosition(target) {
    this._lastTarget = target;

    if (!target) {
      this.setState({
        positionLeft: 0,
        positionTop: 0,
        arrowOffsetLeft: null,
        arrowOffsetTop: null
      });

      return;
    }

    const overlay = ReactDOM.findDOMNode(this);
    const container = getContainer(
      this.props.container, ownerDocument(this).body
    );

    this.setState(calculatePosition(
      this.props.placement,
      overlay,
      target,
      container,
      this.props.containerPadding
    ));
  }
}
