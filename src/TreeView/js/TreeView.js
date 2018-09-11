import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {DragTarget, EditableCollectionView, ListLayout} from '@react/collection-view';
import PropTypes from 'prop-types';
import React from 'react';
import TreeItem from './TreeItem';
import '../style/index.styl';

importSpectrumCSS('treeview');

/**
 * TreeView renders a collapseable heirarchical tree
 */
@autobind
export default class TreeView extends React.Component {
  static propTypes = {
    /** The datasource for the tree view. Should be a subclass of `TreeViewDataSource`. */
    dataSource: PropTypes.object.isRequired,

    /** A function which renders an item in the tree */
    renderItem: PropTypes.func.isRequired,

    /* A function that is called when the selection changes. Passes a list of all selected items. */
    onSelectionChange: PropTypes.func,

    /**
     * A function that is called when an item is toggled (expanded/collapsed).
     * Will only fire if item is toggleable and has children.
     * Passes the item being toggled and the isExpanded state.
     */
    onToggleItem: PropTypes.func,

    /** Sets the selected items. Optional. */
    selectedItems: PropTypes.arrayOf(PropTypes.object),

    /** Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /** Whether to allow the user to select multiple items */
    allowsMultipleSelection: PropTypes.bool,

    /** An optional delegate for the tree view. */
    delegate: PropTypes.object,

    /** The timeout after which items automatically expand when dragging over them. */
    dragHoverTimeout: PropTypes.number,

    /** Custom CSS class to add to the tree view */
    className: PropTypes.string
  };

  static defaultProps = {
    allowsSelection: false,
    allowsMultipleSelection: false,
    dragHoverTimeout: 800
  };

  constructor(props) {
    super(props);

    this.layout = new ListLayout({
      rowHeight: 44
    });

    this.delegate = Object.assign({}, proxy(this.props.delegate), proxy(this));
  }

  render() {
    let selectedIndexPaths;
    if (this.props.selectedItems) {
      selectedIndexPaths = this.props.selectedItems.map(item => this.props.dataSource.indexPathForItem(item)).filter(Boolean);
    }

    return (
      <EditableCollectionView
        {...this.props}
        ref={c => this.collection = c}
        className={classNames('spectrum-TreeView', this.props.className)}
        layout={this.layout}
        delegate={this.delegate}
        transitionDuration={300}
        canSelectItems={this.props.allowsSelection}
        selectedIndexPaths={selectedIndexPaths}
        onSelectionChanged={this.onSelectionChange}
        onKeyDown={this.onKeyDown} />
    );
  }

  renderItemView(type, content) {
    return (
      <TreeItem
        content={content}
        renderItem={this.props.renderItem}
        allowsSelection={this.props.allowsSelection}
        onToggle={this.toggleItem.bind(this, content.item)} />
    );
  }

  indentationForItem(section, index) {
    let content = this.collection.getItem(section, index);
    return 28 * content.level;
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'ArrowRight':
        for (let item of this.selectedItems) {
          this.expandItem(item);
        }
        break;

      case 'ArrowLeft':
        for (let item of this.selectedItems) {
          this.collapseItem(item);
        }
        break;
    }
  }

  toggleItem(item) {
    this.props.dataSource.toggleItem(item);

    if (this.props.onToggleItem) {
      const treeItem = this.props.dataSource._getItem(item);
      if (treeItem && treeItem.isToggleable && treeItem.hasChildren) {
        this.props.onToggleItem(treeItem.item, treeItem.isExpanded);
      }
    }
  }

  expandItem(item) {
    this.props.dataSource.expandItem(item);
  }

  collapseItem(item) {
    this.props.dataSource.collapseItem(item);
  }

  selectItem(item) {
    let indexPath = this.props.dataSource.indexPathForItem(item);
    if (indexPath) {
      this.collection.selectItem(indexPath);
    }
  }

  get selectedItems() {
    if (!this.collection) {
      return [];
    }

    return Array.from(this.collection.selectedIndexPaths)
      .map(indexPath => this.collection.getItem(indexPath).item);
  }

  shouldSelectItem(indexPath) {
    let item = this.collection.getItem(indexPath).item;
    if (this.props.delegate && this.props.delegate.shouldSelectItem) {
      return this.props.delegate.shouldSelectItem(item);
    }

    return true;
  }

  onSelectionChange() {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this.selectedItems);
    }
  }

  getDropTarget(target) {
    let item = this.collection.getItem(target.indexPath).item;

    if (this.props.delegate && !this.props.delegate.shouldAcceptDrop(item)) {
      return null;
    }

    return target;
  }

  dropTargetUpdated(dropTarget) {
    clearTimeout(this._dragHoverTimer);

    // Expand tree items when a drag hovers over
    if (dropTarget && dropTarget.dropPosition === DragTarget.DROP_ON) {
      this._dragHoverTimer = setTimeout(() => {
        let item = this.collection.getItem(dropTarget.indexPath);
        if (item) {
          this.expandItem(item.item);
        }
      }, this.props.dragHoverTimeout);
    }
  }
}

/**
 * Creates a proxy object containing all of the methods of the input object
 * bound to that object, such that calling them still applies to the input
 * object. This allows combining the methods of two objects without mutating
 * either one.
 */
function proxy(obj) {
  let res = {};
  if (!obj) {
    return res;
  }

  for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
    if (typeof obj[key] === 'function') {
      res[key] = obj[key].bind(obj);
    }
  }

  return res;
}
