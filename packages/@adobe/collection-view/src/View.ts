import {EventEmitter} from 'events';

type Handler = (event: Event) => void;

let KEY = 0;

export class View extends EventEmitter {
  style: {[key: string]: any};
  attrs: {[key: string]: any};
  events: Map<string, Set<Handler>>;
  classes: Set<string>;
  children: Set<View>;
  key: number;
  dirty: boolean;
  backendView: any;

  constructor() {
    super();
    this.style = {};
    this.attrs = {};
    this.events = new Map;
    this.classes = new Set;
    this.children = new Set;
    this.key = KEY++;
    this.dirty = true;
    this.backendView = null;
  }

  onEvent(event: string, fn: Handler) {
    let handlers = this.events.get(event);
    if (!handlers) {
      handlers = new Set();
      this.events.set(event, handlers);
    }

    handlers.add(fn);
  }

  offEvent(event: string, fn: Handler) {
    let handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(fn);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  setAttribute(attribute: string, value: any) {
    if (this.attrs[attribute] !== value) {
      this.attrs = Object.assign({}, this.attrs, {
        [attribute]: value
      });
      this.flushUpdates();
    }
  }

  removeAttribute(attribute) {
    if (this.attrs[attribute] != null) {
      this.attrs = Object.assign({}, this.attrs);
      delete this.attrs[attribute];
      this.flushUpdates();
    }
  }

  css(style = {}) {
    this.style = Object.assign({}, this.style, style);
    this.flushUpdates();
  }

  addChild(view: View) {
    this.dirty = true;
    this.children.add(view);
  }

  removeChild(view: View) {
    this.dirty = true;
    this.children.delete(view);
  }

  replaceChildren(view: View) {
    this.dirty = true;
    this.children.clear();
    this.children.add(view);
  }

  addClass(className = '') {
    for (let name of className.split(' ')) {
      this.classes.add(name);
    }

    this.flushUpdates();
  }

  removeClass(className = '') {
    for (let name of className.split(' ')) {
      this.classes.delete(name);
    }

    this.flushUpdates();
  }

  getClassName() {
    return Array.from(this.classes).join(' ');
  }

  renderBackendView(backend) {
    if (!this.backendView) {
      this.backendView = backend.createView(this);
    }

    this._updateChildren();
    return this.backendView.render(backend);
  }

  renderChildren(context) {
    // Do nothing by default
  }

  private _updateChildren() {
    if (this.backendView && this.dirty) {
      this.renderChildren(this.backendView.getRenderContext());
    }
  }

  flushUpdates(fn?: () => void) {
    this.dirty = true;

    if (this.backendView) {
      this._updateChildren();
      this.backendView.flushUpdates(fn);
    } else if (fn) {
      // The view is not mounted anywhere yet, but we should
      // still call the callback. Mostly for testing.
      setTimeout(fn, 0);
    }
  }

  forceStyleUpdate() {
    if (this.backendView) {
      this.backendView.forceStyleUpdate();
    }
  }

  getRect() {
    return this.backendView.getRect();
  }

  getSize() {
    return this.backendView.getSize();
  }

  getDOMNode(): HTMLElement {
    return this.backendView.getDOMNode();
  }

  triggerEvent(event) {
    if (this.backendView) {
      this.backendView.triggerEvent(event);
    }
  }

  /**
   * Sets focus to backendView DOM element if it is focusable.
   */
  focus() {
    const node = this.getDOMNode();

    if (node && typeof node.focus === 'function') {
      node.focus();
    }
  }
}
