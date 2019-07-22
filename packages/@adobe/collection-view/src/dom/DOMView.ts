import {Rect} from '../Rect';
import {Size} from '../Size';
import {View} from '../View';
import {DOMBackend} from './DOMBackend';
import {BackendView} from '../types';

export default class DOMView implements BackendView<DOMBackend> {
  view: View;
  dom: HTMLElement;
  backend: DOMBackend;
  children: Set<View>;

  constructor(view: View) {
    this.view = view;
  }

  getRenderContext() {
    if (!this.dom) {
      this.dom = document.createElement('div');
    }

    return this.dom;
  }

  render(backend: DOMBackend) {
    if (!this.backend && this.dom) {
      for (let attr in this.view.attrs) {
        this.dom.setAttribute(attr, this.view.attrs[attr]);
      }

      for (let [event, handlers] of this.view.events) {
        for (let handler of handlers) {
          this.dom.addEventListener(event.toLowerCase(), handler);
        }
      }

      this.children = new Set;
      this.backend = backend;
    }

    this.flushUpdates();
    return this.dom;
  }

  flushUpdates(fn?: () => void) {
    if (this.view.dirty) {
      Object.assign(this.dom.style, this.view.style);
      this.dom.className = this.view.getClassName();

      for (let child of this.view.children) {
        if (!this.children.has(child)) {
          this.dom.appendChild(child.renderBackendView ? child.renderBackendView(this.backend) : child);
        } else if (child.renderBackendView) {
          child.renderBackendView(this.backend);
        }
      }

      for (let child of this.children) {
        if (!this.view.children.has(child)) {
          this.dom.removeChild(child.backendView ? child.backendView.dom : child);
        }
      }

      this.children = new Set(this.view.children);
      this.view.dirty = false;
    }

    if (fn) {
      fn();
    }
  }

  forceStyleUpdate() {
    window.getComputedStyle(this.getDOMNode()).opacity;
  }

  getRect() {
    let rect = this.getDOMNode().getBoundingClientRect();
    return new Rect(rect.left, rect.top, rect.width, rect.height);
  }

  getSize() {
    let node = this.getDOMNode().firstChild as HTMLElement; // TODO
    let style = window.getComputedStyle(node);
    let xMargins = (parseInt(style.marginLeft || '', 10) + parseInt(style.marginRight || '', 10)) || 0;
    let yMargins = (parseInt(style.marginTop || '', 10) + parseInt(style.marginBottom || '', 10)) || 0;
    return new Size(node.offsetWidth + xMargins, node.offsetHeight + yMargins);
  }

  getDOMNode() {
    return this.dom;
  }

  triggerEvent(event: string) {
    let evt = document.createEvent('Event');
    evt.initEvent(event, false, false);
    this.getDOMNode().dispatchEvent(evt);
  }
}
