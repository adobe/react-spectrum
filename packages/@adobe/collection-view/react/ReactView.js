import DOMView from '../src/dom/DOMView';
import React from 'react';
import ReactDOM from 'react-dom';

export default class ReactView extends DOMView {
  constructor(view) {
    super(view);
    this.component = null;
  }

  getRenderContext() {
    return this;
  }

  getEventHandlers() {
    let events = {};
    for (let [event, handlers] of this.view.events) {
      let key = 'on' + event[0].toUpperCase() + event.slice(1);
      events[key] = (event) => {
        for (let handler of handlers) {
          handler(event);
        }
      };
    }

    return events;
  }

  flushUpdates(fn) {
    if (this.component) {
      this.component.forceUpdate(fn);
    }
  }

  render(backend) {
    return (
      <View reactView={this} backend={backend} />
    );
  }

  getDOMNode() {
    if (this.component) {
      return ReactDOM.findDOMNode(this.component);
    }

    let container = document.createElement('div');
    ReactDOM.render(this.render(), container);
    let res = container.firstChild;
    ReactDOM.unmountComponentAtNode(container);
    return res;
  }
}

class View extends React.Component {
  shouldComponentUpdate(props) {
    return props.reactView.view.dirty;
  }

  render() {
    let reactView = this.props.reactView;
    let view = reactView.view;

    var res = (
      <div {...view.attrs} {...reactView.getEventHandlers()} style={view.style} className={view.getClassName()}>
        {Array.from(view.children).map((child, index) =>
          React.cloneElement(
            child.renderBackendView ? child.renderBackendView(this.props.backend) : child,
            {key: child.key || index}
          )
        )}
      </div>
    );

    view.dirty = false;
    return res;
  }

  componentWillMount() {
    this.props.reactView.component = this;
  }

  componentWillUnmount() {
    this.props.reactView.component = null;
  }
}
