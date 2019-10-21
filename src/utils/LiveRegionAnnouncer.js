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

import convertUnsafeMethod from './convertUnsafeMethod';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './style/index.styl';
import VisuallyHidden from '../VisuallyHidden';

/* Inspired by https://github.com/AlmeroSteyn/react-aria-live */
let liveRegionAnnouncer = null;
let node = null;
let clearAssertiveTimeoutId = null;
let clearPoliteTimeoutId = null;
const LIVEREGION_TIMEOUT_DELAY = 1000;

export default class LiveRegionAnnouncer extends Component {
  state = {
    assertiveMessage: '',
    politeMessage: ''
  };

  static getInstance(callback, context) {
    if (!liveRegionAnnouncer) {
      node = document.createElement('div');
      document.body.appendChild(node);
      ReactDOM.render(<LiveRegionAnnouncer ref={l => liveRegionAnnouncer = l} />, node, callback);
    } else if (callback) {
      callback();
    }
    return liveRegionAnnouncer;
  }

  static destroyInstance(callback) {
    if (liveRegionAnnouncer) {
      liveRegionAnnouncer.setState({
        assertiveMessage: '',
        politeMessage: ''
      },
      () => {
        const instanceNode = ReactDOM.findDOMNode(liveRegionAnnouncer);
        instanceNode && ReactDOM.unmountComponentAtNode(instanceNode.parentNode);
        if (callback) {
          // wait a frame for component to unmount
          setTimeout(callback, 50);
        }
      });
    }
  }

  componentWillUnmount() {
    if (node) {
      document.body.removeChild(node);
    }
    liveRegionAnnouncer = null;
    node = null;
  }

  static announceAssertive(message, timeoutDuration = LIVEREGION_TIMEOUT_DELAY) {
    if (clearAssertiveTimeoutId) {
      clearTimeout(clearAssertiveTimeoutId);
      clearAssertiveTimeoutId = null;
    }
    LiveRegionAnnouncer.getInstance(
      () => liveRegionAnnouncer.setState({
        assertiveMessage: message
      },
      () => {
        if (message !== '') {
          clearAssertiveTimeoutId = setTimeout(() => LiveRegionAnnouncer.clearMessage('assertive'), timeoutDuration);
        }
      })
    );
  }

  static announcePolite(message, timeoutDuration = LIVEREGION_TIMEOUT_DELAY) {
    if (clearPoliteTimeoutId) {
      clearTimeout(clearPoliteTimeoutId);
      clearPoliteTimeoutId = null;
    }
    LiveRegionAnnouncer.getInstance(
      () => liveRegionAnnouncer.setState({
        politeMessage: message
      },
      () => {
        if (message !== '') {
          clearPoliteTimeoutId = setTimeout(() => LiveRegionAnnouncer.clearMessage('polite'), timeoutDuration);
        }
      })
    );
  }

  static clearMessage(politeness) {
    LiveRegionAnnouncer.getInstance(
      () => {
        if (!politeness) {
          LiveRegionAnnouncer.announceAssertive('');
          LiveRegionAnnouncer.announcePolite('');
        } else {
          liveRegionAnnouncer.setState({
            [politeness + 'Message']: ''
          });
        }
      }
    );
  }

  render() {
    const {
      assertiveMessage,
      politeMessage
    } = this.state;
    return (
      <LiveRegion
        assertiveMessage={assertiveMessage}
        politeMessage={politeMessage} />
    );
  }
}

@convertUnsafeMethod
export class LiveRegion extends Component {
  state = {
    assertiveMessage1: '',
    assertiveMessage2: '',
    politeMessage1: '',
    politeMessage2: ''
  };

  useAlternatePolite = false;
  useAlternateAssertive = false;

  static propTypes = {
    assertiveMessage: PropTypes.string,
    politeMessage: PropTypes.string
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      assertiveMessage: oldAssertiveMessage,
      politeMessage: oldPoliteMessage
    } = this.props;
    const {
      assertiveMessage,
      politeMessage
    } = nextProps;

    if (oldPoliteMessage !== politeMessage) {
      this.setState({
        politeMessage1: this.useAlternatePolite ? '' : politeMessage,
        politeMessage2: this.useAlternatePolite ? politeMessage : ''
      });
      this.useAlternatePolite = !this.useAlternatePolite;
    }

    if (oldAssertiveMessage !== assertiveMessage) {
      this.setState({
        assertiveMessage1: this.useAlternateAssertive ? '' : assertiveMessage,
        assertiveMessage2: this.useAlternateAssertive ? assertiveMessage : ''
      });
      this.useAlternateAssertive = !this.useAlternateAssertive;
    }
  }

  render() {
    const {
      assertiveMessage1,
      assertiveMessage2,
      politeMessage1,
      politeMessage2
    } = this.state;
    return (
      <VisuallyHidden element="div">
        <MessageBlock aria-live="assertive" message={assertiveMessage1} />
        <MessageBlock aria-live="assertive" message={assertiveMessage2} />
        <MessageBlock aria-live="polite" message={politeMessage1} />
        <MessageBlock aria-live="polite" message={politeMessage2} />
      </VisuallyHidden>
    );
  }
}

export const MessageBlock = ({message, 'aria-live': ariaLive}) => (
  <VisuallyHidden
    element="div"
    aria-live={ariaLive}
    aria-relevant="additions"
    aria-atomic="true">
    {message || ''}
  </VisuallyHidden>
);

MessageBlock.propTypes = {
  message: PropTypes.string,
  'aria-live': PropTypes.string.isRequired
};

export class LiveRegionMessage extends Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    'aria-live': PropTypes.string.isRequired,
    clearOnUnmount: PropTypes.bool
  };

  componentDidMount() {
    this.announce();
  }

  componentDidUpdate(prevProps) {
    if (this.props.message !== prevProps.message) {
      this.announce();
    }
  }

  componentWillUnmount() {
    if (this.props.clearOnUnmount) {
      LiveRegionAnnouncer.clearMessage();
    }
  }

  announce() {
    const {
      message,
      'aria-live': ariaLive
    } = this.props;
    if (ariaLive === 'assertive') {
      LiveRegionAnnouncer.announceAssertive(message || '');
    }
    if (ariaLive === 'polite') {
      LiveRegionAnnouncer.announcePolite(message || '');
    }
  }

  render() {
    return null;
  }
}
