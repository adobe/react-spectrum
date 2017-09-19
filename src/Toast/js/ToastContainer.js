import CSSTransition from 'react-transition-group/CSSTransition';
import React from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';
import TransitionGroup from 'react-transition-group/TransitionGroup';

let TOAST_CONTAINER = null;
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

  remove(toast) {
    this.setState({
      toasts: this.state.toasts.filter(t => t !== toast)
    });
  }

  render() {
    return (
      <TransitionGroup className="coral-ToastContainer">
        {this.state.toasts.map((toast, i) =>
          (<CSSTransition key={i} classNames="coral-Toast-slide" timeout={TOAST_ANIMATION_TIME}>
            {React.cloneElement(toast, {onClose: this.remove.bind(this, toast)})}
          </CSSTransition>)
        )}
      </TransitionGroup>
    );
  }
}

function ensureToastContainer() {
  if (TOAST_CONTAINER) {
    return TOAST_CONTAINER;
  }

  let node = document.createElement('div');
  document.body.appendChild(node);
  TOAST_CONTAINER = ReactDOM.render(<ToastContainer />, node);
  return TOAST_CONTAINER;
}

export function addToast(toast, timeout) {
  ensureToastContainer().add(toast, timeout);
}

export function removeToast(toast) {
  ensureToastContainer().remove(toast);
}

export function success(message, options = {}) {
  addToast(<Toast closable variant="success" {...options}>{message}</Toast>, options.timeout);
}

export function warning(message, options = {}) {
  addToast(<Toast closable variant="warning" {...options}>{message}</Toast>, options.timeout);
}

export function error(message, options = {}) {
  addToast(<Toast closable variant="error" {...options}>{message}</Toast>, options.timeout);
}

export function info(message, options = {}) {
  addToast(<Toast closable variant="info" {...options}>{message}</Toast>, options.timeout);
}

export function help(message, options = {}) {
  addToast(<Toast closable variant="help" {...options}>{message}</Toast>, options.timeout);
}
