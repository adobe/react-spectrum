import React from 'react';
import {ReusableView} from '../src';

export default class ReactReusableView extends ReusableView {
  constructor(type) {
    super();
    this.type = type;
    this.states = {};
    this.addClass(type);
  }

  render() {
    let element;

    if (this.layoutInfo.type === 'item') {
      element = this.collectionView.delegate.renderItemView(this.type, this.content);
    } else {
      element = this.collectionView.delegate.renderSupplementaryView(this.layoutInfo.type, this.layoutInfo.section, this.layoutInfo.index);
    }

    let props = Object.assign({
      onLoad: this.onLoad.bind(this, this.content),
      onResize: this.onLoad.bind(this, this.content),
      collectionView: this.collectionView,
      layoutInfo: this.layoutInfo,
      reusableView: this,
      ref: (component) => this.component = component
    }, this.states);

    element = React.cloneElement(element, props);
    this.replaceChildren(element);
  }

  onLoad(content) {
    if (this.content === content && this.collectionView) {
      let indexPath = this.collectionView.indexPathForView(this);
      if (indexPath) {
        this.collectionView.updateItemSize(indexPath);
      }
    }
  }

  applyLayoutInfo(layoutInfo) {
    if (this.component && typeof this.component.componentWillLayout === 'function') {
      this.component.componentWillLayout(layoutInfo);
    }

    super.applyLayoutInfo(layoutInfo);
  }

  addState(state) {
    if (!this.states[state]) {
      this.states[state] = true;
      this.contentChanged = true;
    }

    super.addState(state);
  }

  removeState(state) {
    if (this.states[state]) {
      delete this.states[state];
      this.contentChanged = true;
    }

    super.removeState(state);
  }

  /**
   * Sets focus to rendered component element of reusable view.
   */
  focus() {
    if (this.component && typeof this.component.focus === 'function') {
      this.component.focus();
    } else {
      super.focus();
    }
  }
}
