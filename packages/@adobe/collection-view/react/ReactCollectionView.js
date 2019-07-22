import {
  CollectionView as _CollectionView,
  EditableCollectionView as _EditableCollectionView,
  ReusableView,
  Size
} from '../src';
import React from 'react';
import ReactBackend from './ReactBackend';
import ReactDOM from 'react-dom';
import ReactReusableView from './ReactReusableView';

export let CollectionView = createReactComponent(_CollectionView);
export let EditableCollectionView = createReactComponent(_EditableCollectionView);

function createReactComponent(Super) {
  class Collection extends Super {
    static displayName = Super.name;

    constructor(props) {
      super(props);
      React.Component.call(this, props);

      this.reactEvents = {};
      this.backend = ReactBackend;
      this.updateSize = this.updateSize.bind(this);

      if (props.className) {
        this.addClass(props.className);
      }
    }

    createView(type, section, index) {
      return new ReactReusableView(type);
    }

    _getDragViewFromDelegate(target, indexPaths) {
      if (this.delegate.renderDragView) {
        var view = new ReusableView;
        var element = this.delegate.renderDragView(target, indexPaths);
        view.replaceChildren(element);
        return view;
      }
    }

    /**
     * Returns the IndexPath that the given React component represents.
     * Returns null if the view is not currently visible.
     * @param {ReactComponent} component
     * @return {IndexPath}
     */
    indexPathForComponent(component) {
      return this.indexPathForView(component.props.reusableView);
    }

    /**
     * Returns the visible React component for the given section and index.
     * You can also pass an IndexPath as the only argument instead.
     * Returns null if the view is not currently visible.
     * @param {number|IndexPath} section
     * @param {number} index
     * @return {ReactComponent}
     */
    componentForItem(section, index) {
      let view = this.getItemView(section, index);
      return view && view.component;
    }

    componentDidMount() {
      this.updateSize(this.props);
      this.updateEvents(this.props);

      if (!this.props.width || !this.props.height) {
        window.addEventListener('resize', this.updateSize, false);
      }
    }

    shouldComponentUpdate(props) {
      // This component should never re-render. All prop
      // changes are handled by componentWillReceiveProps.
      return false;
    }

    /**
     * Updates the size of the collection view.
     * By default, it will fill the containing dom node.
     * @param {object} props
     */
    updateSize(props = {}) {
      let dom = ReactDOM.findDOMNode(this);
      this.size = new Size(props.width || dom.offsetWidth, props.height || dom.offsetHeight);
    }

    componentWillReceiveProps(props) {
      this.updateSize(props);

      // Update CSS class name
      if (props.className !== this.props.className) {
        if (this.props.className) {
          this.removeClass(this.props.className);
        }

        this.addClass(props.className);
      }

      this.updateAccessibilityAttributes(props);

      // Update CollectionView properties
      for (let key in props) {
        if (this[key] !== undefined && props[key] !== undefined && props[key] !== this[key]) {
          this[key] = props[key];
        }
      }

      // Update events
      this.updateEvents(props);
    }

    eventName(key) {
      return key.replace(/^on([A-Z])/, function (m, letter) {
        return letter.toLowerCase();
      });
    }

    updateEvents(props) {
      // Remove events that are no longer on the props
      for (let key in this.reactEvents) {
        if (!props[key]) {
          let event = this.eventName(key);
          this.removeListener(event, this.reactEvents[key]);
          delete this.reactEvents[key];
        }
      }

      // Replace/add events from the new props
      for (let key in props) {
        if (/^on[A-Z]/.test(key) && this.reactEvents[key] !== props[key]) {
          let event = this.eventName(key);

          // Remove old event if any
          if (this.reactEvents[key]) {
            this.removeListener(event, this.reactEvents[key]);
            delete this.reactEvents[key];
          }

          // Add new event, if it exists
          if (props[key]) {
            this.on(event, props[key]);
            this.reactEvents[key] = props[key];
          }
        }
      }
    }

    componentWillUnmount() {
      if (this._teardownEvents) {
        this._teardownEvents();
        window.removeEventListener('resize', this.updateSize, false);
      }
    }
  }

  // Make it into a React component by extending the prototype
  for (let key of Object.getOwnPropertyNames(React.Component.prototype)) {
    Object.defineProperty(Collection.prototype, key, Object.getOwnPropertyDescriptor(React.Component.prototype, key));
  }

  return Collection;
}
