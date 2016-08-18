import React, { Component } from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import classNames from 'classnames';

import './SlideTransition.styl';

export default class SlideTransition extends Component {
  static defaultProps = {
    name: 'coral-SlideTransition',
    direction: 'right'
  };

  render() {
    const { name, direction, className, children } = this.props;

    return (
      <div className={ classNames(`${ name }-outer-wrapper`, className) }>
        <CSSTransitionGroup
          transitionEnterTimeout={ 200 }
          transitionLeaveTimeout={ 200 }
          component="div"
          transitionName={ `${ name }-${ direction }` }
          className={ `${ name }-transition-group` }
        >
          { children }
        </CSSTransitionGroup>
      </div>
    );
  }
}
