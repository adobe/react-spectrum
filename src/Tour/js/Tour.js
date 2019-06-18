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

import autobind from 'autobind-decorator';
import {chain} from '../../utils/events';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';

const formatMessage = messageFormatter(intlMessages);

export let STATUS_CANCEL = 'cancel';
export let STATUS_COMPLETE = 'complete';

@autobind
export default class Tour extends React.Component {
  static propTypes = {
    /** Hide progress, the current step/total steps number in the
     *  top right of a coachmark, this is passed through */
    disableProgress: PropTypes.bool,

    /** when not clicking on the coachmark itself, this determines the behavior.
     *  - 'next': a click off will behave the same as clicking 'next' on a coachmark
     *  - 'skip': a click off will skip the remainder of the tour
     *  - 'noop': a click off will do nothing
     **/
    clickOutsideAction: PropTypes.oneOf(['next', 'skip', 'noop']),

    /**
     * Event when tour is finished. It's passed 'cancel' if the tour ended via the skip button
     * or other form of early dismissal. It's passed 'complete' if the tour is completed.
     */
    onTourEnd: PropTypes.func
  };

  static defaultProps = {
    disableProgress: false,
    clickOutsideAction: 'noop'
  };

  constructor(props) {
    super(props);

    this.state = {
      current: 0,
      total: 0,
      hidden: false
    };
  }

  componentDidMount() {
    if (this.props.children) {
      this.setState({
        total: React.Children.count(this.props.children)
      });
    }
  }

  onConfirm() {
    if (this.state.current === this.state.total - 1) {
      this.setState({
        hidden: true
      });
      if (this.props.onTourEnd) {
        this.props.onTourEnd(STATUS_COMPLETE);
      }
    } else {
      this.setState({
        current: this.state.current + 1
      });
    }
  }

  onCancel() {
    this.setState({
      current: 0,
      hidden: true
    });
    if (this.props.onTourEnd) {
      this.props.onTourEnd(STATUS_CANCEL);
    }
  }

  onHide(event, currentChild) {
    if (this.props.clickOutsideAction === 'next') {
      chain(this.onConfirm, currentChild.props.onConfirm)(event);
    } else if (this.props.clickOutsideAction === 'skip') {
      chain(this.onCancel, currentChild.props.onCancel)(event);
    }
  }

  render() {
    let {
      children,
      disableProgress,
      clickOutsideAction
    } = this.props;

    let {
      current,
      total,
      hidden
    } = this.state;

    if (!children || React.Children.count(children) <= this.state.current) {
      throw new Error('Tour should always have children!');
    }

    if (hidden) {
      return null;
    }

    let currentChild = React.Children.toArray(this.props.children)[current];
    return React.cloneElement(currentChild, {
      disableProgress,
      currentStep: current + 1,
      totalSteps: total,
      dismissible: (clickOutsideAction === 'skip' || clickOutsideAction === 'next') ? true : undefined,
      onConfirm: chain(this.onConfirm, currentChild.props.onConfirm),
      onCancel: chain(this.onCancel, currentChild.props.onCancel),
      onHide: (event) => this.onHide(event, currentChild),
      confirmLabel: currentChild.props.confirmLabel || (current < total - 1 ? formatMessage('next') : formatMessage('done')),
      cancelLabel: currentChild.props.cancelLabel || (current < total - 1 ? formatMessage('skip') : null)
    });
  }
}
