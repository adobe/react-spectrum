import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {DragTarget, EditableCollectionView, IndexPath, ListLayout} from '@react/collection-view';
import PropTypes from 'prop-types';
import proxy from '../../utils/proxyObject';
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

    /** Whether to allow the user to select no items. */
    allowsEmptySelection: PropTypes.bool,

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
    allowsEmptySelection: true,
    allowsMultipleSelection: false,
    dragHoverTimeout: 800
  };

  constructor(props) {
    super(props);

    this.layout = new ListLayout({
      rowHeight: 44
    });

    this.delegate = Object.assign({}, proxy(this.props.delegate), proxy(this));

    this.treeId = createId();
  }

  render() {
    const {
      selectedItems,
      dataSource,
      className,
      id = this.treeId,
      allowsSelection,
      allowsEmptySelection,
      allowsMultipleSelection
    } = this.props;

    let selectedIndexPaths;
    if (selectedItems) {
      selectedIndexPaths = selectedItems.map(item => dataSource.indexPathForItem(item)).filter(Boolean);
    }

    return (
      <EditableCollectionView
        {...this.props}
        ref={c => this.collection = c}
        className={classNames('spectrum-TreeView', className)}
        layout={this.layout}
        delegate={this.delegate}
        transitionDuration={300}
        canSelectItems={this.props.allowsSelection}
        selectedIndexPaths={selectedIndexPaths}
        onSelectionChanged={this.onSelectionChange}
        onKeyDown={this.onKeyDown}
        role="tree"
        id={id}
        aria-multiselectable={allowsSelection && allowsMultipleSelection}
        selectionMode={allowsSelection && (allowsMultipleSelection || allowsEmptySelection) ? 'toggle' : 'replace'}
        keyboardMode="focus" />
    );
  }

  renderItemView(type, content) {
    return (
      <TreeItem
        treeId={this.props.id || this.treeId}
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
    const {
      dataSource
    } = this.props;
    let focusedItem = this.focusedItem;
    let treeItem;
    let indexPath;
    if (focusedItem) {
      treeItem = dataSource._getItem(focusedItem);
      switch (e.key) {
        case 'ArrowRight':
          if (treeItem && treeItem.hasChildren) {
            if (treeItem.isExpanded) {
              let nextItem = treeItem.children && treeItem.children[0];
              indexPath = nextItem ? dataSource.indexPathForItem(nextItem.item) : null;
            } else {
              e.preventDefault();
              this.expandItem(focusedItem);
            }
          }
          break;
        case 'ArrowLeft':
          if (treeItem) {
            if (treeItem.isExpanded) {
              e.preventDefault();
              this.collapseItem(focusedItem);
            } else if (treeItem.parent) {
              indexPath = dataSource.indexPathForItem(treeItem.parent.item);
            }
          }
          break;
        case 'Home':
          indexPath = new IndexPath(0, 0);
          break;
        case 'End':
          indexPath = new IndexPath(0, dataSource.sections[0].length - 1);
          break;
      }

      if (indexPath) {
        e.preventDefault();
        this.collection.scrollToItem(indexPath);
        this.collection.focusItem(indexPath);
      }
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
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

  get focusedItem() {
    if (!this.collection || !this.collection.focusedIndexPath) {
      return null;
    }

    return this.collection.getItem(this.collection.focusedIndexPath).item;
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

  shouldAcceptDrop() {
    // Override this - we check it below in getDropTarget.
    return true;
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
