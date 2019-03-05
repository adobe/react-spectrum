import autobind from 'autobind-decorator';
import closest from 'dom-helpers/query/closest';
import CoachMarkIndicator from './CoachMarkIndicator';
import CoachMarkPopover from './CoachMarkPopover';
import OverlayTrigger from '../../OverlayTrigger/js/OverlayTrigger';
import Portal from 'react-overlays/lib/Portal';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('coachmark');

@autobind
export default class CoachMark extends React.Component {

  static propTypes = {
    /** Used by overlay trigger */
    parentNode: PropTypes.any,

    /** If there isn't enough space for the coachmark,
     * should it flip across the axis to try and get more space
     **/
    flip: PropTypes.bool,

    /** Relative to the target element, where should the coachmark render */
    placement: PropTypes.oneOf([
      'bottom',
      'bottom left',
      'bottom right',
      'top',
      'top left',
      'top right',
      'right',
      'right bottom',
      'right top',
      'left',
      'left bottom',
      'left top'
    ]),
    /** If someone clicks off the coachmark, then it will hide/dismiss */
    dismissible: PropTypes.bool,
    ...CoachMarkPopover.propTypes,
    ...CoachMarkIndicator.propTypes
  };

  static defaultProps = {
    flip: true,
    placement: 'right',
    ...CoachMarkPopover.defaultProps,
    ...CoachMarkIndicator.defaultProps
  };

  static INDICATOR_OFFSET = 6;

  constructor(props) {
    super(props);
    this.state = {
      overlayContainer: null,
      indicatorPositioned: false
    };
    this.shouldUpdatePosition = true;
  }

  getOverlayContainer() {
    if (this.node) {
      return closest(this.node, '.react-spectrum-provider') || document.body;
    }
    return null;
  }

  componentDidMount() {
    const overlayContainer = this.getOverlayContainer();
    if (overlayContainer) {
      this.setState({overlayContainer});
    }
  }

  onHide() {
    if (this.props.onHide) {
      this.props.onHide();
    }
  }

  /**
   * Because the indicator has to position itself based on its measured size
   * we'll already be a few renders in and the Overlay will be rendered
   * to the wrong position because the indicator isn't in place yet.
   * Once the indicator is in position, it'll emit this event. It'll also
   * emit it every following time, we want to for the Overlay trigger to
   * update the position only the once though, after that, the internals
   * of Overlay will take care of repositioning accurately.
   * This logic tells the state that the indicator has been positioned and we should
   * update to position of the Overlay.
   * There's also logic in componentDidUpdate to make sure it's only called once.
   **/
  onIndicatorPositioned() {
    if (!this.state.indicatorPositioned && this.shouldUpdatePosition) {
      this.setState({indicatorPositioned: true});
    }
  }

  /**
   * Once the indicator is positioned and we've run through a render
   * where we updated the Overlay, then we should no longer
   * need to force the Overlay to update its position.
   **/
  componentDidUpdate() {
    if (this.state.indicatorPositioned) {
      this.shouldUpdatePosition = false;
    }
  }

  render() {
    let {
      quiet,
      selector,
      children,
      dismissible,
      flip,
      placement,
      ...otherProps
    } = this.props;

    let {overlayContainer} = this.state;

    return (
      <div ref={node => this.node = node} style={{display: 'none'}}> {/* need this node so 'this' exists for findDOMNode, Portal won't render a dom node in the current sub-tree */}
        {overlayContainer &&
          <Portal container={overlayContainer}>
            <OverlayTrigger
              trigger={dismissible ? 'click' : undefined}
              show={dismissible ? undefined : true} // {undefined} will force OverlayTrigger to default to {defaultShow}
              defaultShow
              flip={flip}
              placement={placement}
              offset={CoachMark.INDICATOR_OFFSET}
              onHide={this.onHide}
              shouldUpdatePosition={this.state.indicatorPositioned && this.shouldUpdatePosition} >
              <CoachMarkIndicator
                selector={selector}
                quiet={quiet}
                onClick={this.onClickIndicator}
                onPositioned={this.onIndicatorPositioned} />
              <CoachMarkPopover {...otherProps}>
                {children}
              </CoachMarkPopover>
            </OverlayTrigger>
          </Portal>
        }
      </div>
    );
  }
}
