import CSSTransition from 'react-transition-group/CSSTransition';
import React from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import '../style/index.styl';

const TOAST_CONTAINERS = new Map;
const TOAST_TIMEOUT = 5000;
const TOAST_ANIMATION_TIME = 200;

export class ToastContainer extends React.Component {
  state = {
    toasts: []
  };

  add(toast, timeout = TOAST_TIMEOUT) {
    this.setState({
      toasts: [...this.state.toasts, toast]
    });

    if (timeout) {
      setTimeout(this.remove.bind(this, toast), timeout);
    }
  }

  remove(toast, e) {
    const {toasts: currentToasts} = this.state;
    const toasts = currentToasts.filter(t => t !== toast);

    if (toasts.length !== currentToasts.length && toast.props.onClose) {
      toast.props.onClose(e);
    }

    this.setState({toasts});
  }

  render() {
    return (
      <TransitionGroup className="react-spectrum-ToastContainer">
        {this.state.toasts.map((toast, i) =>
          (<CSSTransition key={i} classNames="react-spectrum-Toast-slide" timeout={TOAST_ANIMATION_TIME}>
            {React.cloneElement(toast, {onClose: this.remove.bind(this, toast)})}
          </CSSTransition>)
        )}
      </TransitionGroup>
    );
  }
}

function createToastNode(container) {
  let parent = container || document.querySelector('.react-spectrum-provider') || document.body;
  let node = document.createElement('div');
  parent.appendChild(node);
  return node;
}

function ensureToastContainer(container, callback) {
  let toastContainer = TOAST_CONTAINERS.get(container);

  // Make sure that toastContainer is a real DOM node, not only a memory footprint of previously cached node.
  if (toastContainer && document.body.contains(ReactDOM.findDOMNode(toastContainer))) {
    callback(toastContainer);
  } else {
    let toastContainerRef;
    ReactDOM.render(<ToastContainer ref={ref => toastContainerRef = ref} />, createToastNode(container), () => {
      TOAST_CONTAINERS.set(container, toastContainerRef);
      callback(toastContainerRef);
    });
  }
}

export function addToast(toast, timeout, container) {
  ensureToastContainer(container, toastContainer => toastContainer.add(toast, timeout));
}

export function removeToast(toast, container) {
  ensureToastContainer(container, toastContainer => toastContainer.remove(toast));
}

export function success(message, options = {}) {
  addToast(<Toast closable variant="success" {...options}>{message}</Toast>, options.timeout, options.container);
}

export function warning(message, options = {}) {
  addToast(<Toast closable variant="warning" {...options}>{message}</Toast>, options.timeout, options.container);
}

export function error(message, options = {}) {
  addToast(<Toast closable variant="error" {...options}>{message}</Toast>, options.timeout, options.container);
}

export function info(message, options = {}) {
  addToast(<Toast closable variant="info" {...options}>{message}</Toast>, options.timeout, options.container);
}

export function help(message, options = {}) {
  addToast(<Toast closable variant="help" {...options}>{message}</Toast>, options.timeout, options.container);
}
