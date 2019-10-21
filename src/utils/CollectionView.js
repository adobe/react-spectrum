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
import classNames from 'classnames';
import convertUnsafeMethod from './convertUnsafeMethod';
import {DragTarget, EditableCollectionView} from '@react/collection-view';
import loadingLayout from './loadingLayout';
import PropTypes from 'prop-types';
import Provider from '../Provider';
import proxy from './proxyObject';
import React from 'react';
import Wait from '../Wait';
import './style/CollectionView/index.styl';

// symbol + counter for requests
let REQUEST_ID = 1;
let LAST_REQUEST = Symbol('lastRequest');

@convertUnsafeMethod
@autobind
export default class CollectionView extends React.Component {
  // These come from the parent Provider. Used to set the correct props
  // to the provider that wraps the drag view.
  static contextTypes = {
    theme: PropTypes.string,
    scale: PropTypes.string,
    locale: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.isLoading = false;
    this.hasMore = true;
    this[LAST_REQUEST] = 0;
    this.state = {
      delegate: Object.assign({}, proxy(this), proxy(props.dataSource)),
      isDropTarget: false
    };
  }

  componentDidMount() {
    this.props.layout.component = this;
    if (this.collection) {
      this.collection.setLayout(loadingLayout(this.props.layout));
    }

    this.setupDataSource(this.props.dataSource);
    this.reloadData();
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (props.layout !== this.props.layout) {
      props.layout.component = this;
      if (this.collection) {
        this.collection.setLayout(loadingLayout(props.layout), props.animateLayoutChanges);
      }
    }

    if (props.dataSource !== this.props.dataSource) {
      this.setState({
        delegate: Object.assign({}, proxy(this), proxy(props.dataSource))
      });

      this.teardownDataSource(this.props.dataSource);
      this.setupDataSource(props.dataSource);
      this.reloadData(props);
    } else if (('sortDescriptor' in props) && !this.isEqualSortDescriptor(props.sortDescriptor, this.props.sortDescriptor)) {
      // TODO: should this actually update here or is it up to the user to call performSort themselves.
      this.updateSort(props.sortDescriptor);
    }
  }

  componentDidUpdate() {
    // Re-render empty views on prop update in case renderEmptyView would change.
    if (this.collection) {
      this.collection.reloadSupplementaryViewsOfType('empty-view');
    }
  }

  componentWillUnmount() {
    this.teardownDataSource(this.props.dataSource);
  }

  setupDataSource(dataSource) {
    dataSource.on('reloadData', this.reloadData);
  }

  teardownDataSource(dataSource) {
    dataSource.removeListener('reloadData', this.reloadData);
  }

  isEqualSortDescriptor(a, b) {
    if (!a || !b) {
      return !a === !b;
    }

    return a.column === b.column && a.direction === b.direction;
  }

  async reloadData(props = this.props) {
    // reset hasMore when reloading
    this.hasMore = true;
    await this.performLoad(() =>
      props.dataSource.performLoad(props.sortDescriptor)
    );
  }

  async updateSort(sortDescriptor) {
    await this.performLoad(() =>
      this.props.dataSource.performSort(sortDescriptor)
    );
  }

  async performLoad(fn) {
    let requestId = REQUEST_ID++;
    try {
      this.isLoading = true;
      if (this.collection) {
        this.collection.relayout();
      }

      this[LAST_REQUEST] = requestId;
      await fn();
    } finally {
      // only relayout if the completed request is the last request made
      if (this[LAST_REQUEST] === requestId) {
        this.isLoading = false;
        if (this.collection) {
          this.collection.relayout();
        }
      }
    }
  }

  onScroll(offset) {
    if (this.props.onScroll) {
      this.props.onScroll(offset);
    }

    if (!this.collection || this.isLoading) {
      return;
    }

    let scrollOffset = this.collection.contentSize.height - this.collection.size.height * 2;
    if (this.hasMore && this.collection.contentOffset.y > scrollOffset) {
      this.performLoad(async () => {
        let res = await this.props.dataSource.performLoadMore();
        if (typeof res === 'boolean') {
          this.hasMore = res;
        }
      });
    }
  }

  dropTargetUpdated(target) {
    // Highlight the entire collection view if the drop position is between, but the default
    // drop position from props is "on". This means the drop was over a non-target item.
    // Also do this if the drop position is "between" and the collection view is empty.
    let isDropTarget = target &&
      target.type === 'item' &&
      target.indexPath.section === 0 &&
      target.indexPath.index === 0 &&
      target.dropPosition === DragTarget.DROP_BETWEEN &&
      (this.props.dropPosition === 'on' || this.collection.getSectionLength(0) === 0);

    if (isDropTarget && !this.state.isDropTarget) {
      this.setState({isDropTarget: true});
    } else if (this.state.isDropTarget) {
      this.setState({isDropTarget: false});
    }
  }

  renderItemView(type, data) {
    return this.props.renderItemView(type, data);
  }

  renderDragView(target) {
    let dragView;
    let style = {
      background: 'transparent'
    };

    // Use custom drag renderer if provided,
    // otherwise just get the existing item view.
    if (this.props.renderDragView) {
      dragView = this.props.renderDragView(target, this.collection.selectedIndexPaths);
    } else {
      // Get the item wrapper view from collection-view. The first child is the actual item component.
      let view = this.collection.getItemView(target.indexPath);
      dragView = [...view.children][0];

      style.width = view.layoutInfo.rect.width;
      style.height = view.layoutInfo.rect.height;
    }

    // Wrap in a spectrum provider so spectrum components are themed correctly.
    return (
      <Provider {...this.context} style={style}>
        {dragView}
      </Provider>
    );
  }

  renderSupplementaryView(type) {
    const {renderEmptyView, renderSupplementaryView, role, colCount} = this.props;
    let supplementaryView;

    if (renderSupplementaryView) {
      supplementaryView = renderSupplementaryView(type);
    }

    if (!supplementaryView) {
      const wrapInRow = role === 'grid' || role === 'rowgroup';

      if (type === 'loading-indicator') {
        supplementaryView = <Wait centered size="M" />;
      }

      if (type === 'empty-view' && renderEmptyView) {
        supplementaryView = renderEmptyView();
      }

      if (supplementaryView && wrapInRow) {
        supplementaryView = (
          <RowWrapper colCount={colCount}>
            {supplementaryView}
          </RowWrapper>
        );
      }
    }

    return supplementaryView || <div role="presentation" />;
  }

  render() {
    let {
      className,
      ...otherProps
    } = this.props;

    delete otherProps.layout;

    return (
      <EditableCollectionView
        {...otherProps}
        ref={c => this.collection = c}
        className={classNames(className, {
          'is-drop-target': this.state.isDropTarget
        })}
        delegate={this.state.delegate}
        onScroll={this.onScroll} />
    );
  }
}

export class RowWrapper extends React.Component {
  render() {
    const {
      children,
      colCount,
      className
    } = this.props;
    return (
      <div role="row" className={classNames('react-spectrum-CollectionView-rowWrapper', className)}>
        <div role="rowheader" aria-colspan={colCount}>
          {children}
        </div>
      </div>
    );
  }
}
