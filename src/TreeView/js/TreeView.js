import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {DragTarget, EditableCollectionView, IndexPath, ListLayout} from '@react/collection-view';
import PropTypes from 'prop-types';
import Provider from '../../Provider';
import proxy from '../../utils/proxyObject';
import React from 'react';
import TreeItem from './TreeItem';
import '../style/index.styl';
import TreeViewDataSource from './TreeViewDataSource';
import TreeViewDelegate from './TreeViewDelegate';

importSpectrumCSS('treeview');

/**
 * TreeView renders a collapseable heirarchical tree
 */
@autobind
export default class TreeView extends React.Component {
  static propTypes = {
    /** The datasource for the tree view. Should be a subclass of `TreeDataSource`. */
    dataSource: PropTypes.object.isRequired,

    /** A function which renders an item in the tree */
    renderItem: PropTypes.func.isRequired,

    /* A function that is called when the selection changes. Passes a list of all selected items. */
    onSelectionChange: PropTypes.func,

    /**
     * A function that is called when an item is toggled (expanded/collapsed).
     * Will only fire if item is toggleable and has children.
     * Passes the item being toggled and the isExpanded state, along 
     * with a list of all currently expanded items, which can be passed back 
     * to the expandedItems prop.
     */
    onToggleItem: PropTypes.func,

    /** Sets the selected items. Optional. */
    selectedItems: PropTypes.arrayOf(PropTypes.object),

    /** Sets the disabled items. Optional. */
    disabledItems: PropTypes.arrayOf(PropTypes.object),

    /** Sets the expanded items. Optional. */
    expandedItems: PropTypes.arrayOf(PropTypes.object),

    /** Sets the default expanded items. Optional. */
    defaultExpandedItems: PropTypes.arrayOf(PropTypes.object),

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

    /** Whether the user can drag rows from the table. */
    canDragItems: PropTypes.bool,

    /** A function which renders the view to display under the cursor during drag and drop. */
    renderDragView: PropTypes.func,

    /**
     * Whether the TableView accepts drops.
     * If `true`, the table accepts all types of drops. Alternatively,
     * it can be set to an array of accepted drop types.
     */
    acceptsDrops: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),

    /** Custom CSS class to add to the tree view */
    className: PropTypes.string
  };

  static defaultProps = {
    allowsSelection: false,
    allowsEmptySelection: true,
    allowsMultipleSelection: false,
    dragHoverTimeout: 800
  };

  // These come from the parent Provider. Used to set the correct props
  // to the provider that wraps the drag view.
  static contextTypes = {
    theme: PropTypes.string,
    scale: PropTypes.string,
    locale: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.layout = new ListLayout({
      rowHeight: 44
    });

    this.treeId = createId();

    let dataSource = this.getDataSource(props);
    let delegate = this.getDelegate(props, dataSource);
    this.state = {
      dataSource,
      delegate
    };
  }

  getDataSource(props) {
    // If the data source provided is a TreeViewDataSource (old API), use it directly,
    // otherwise wrap it.
    let dataSource = props.dataSource instanceof TreeViewDataSource
      ? props.dataSource
      : new TreeViewDataSource(props.dataSource, {
        disabledItems: props.disabledItems,
        expandedItems: props.expandedItems || props.defaultExpandedItems
      });

    // Update selected items once loaded
    if (props.selectedItems) {
      dataSource.once('load', () => this.forceUpdate());
    }

    return dataSource;
  }

  getDelegate(props, dataSource) {
    // Combine the data source and delegate objects.
    // Providing methods on the data source has superseded providing an explicit delegate,
    // but the old way is supported for backward compatibility.
    let combinedDelegate = Object.assign({}, proxy(props.dataSource), proxy(props.delegate));

    // Create a delegate proxy object, which ensures that the delegate methods are 
    // called with item objects rather than IndexPaths, which don't make sense in a tree.
    let delegate = new TreeViewDelegate(dataSource, combinedDelegate);

    // Finally, combine the delegate with the TreeView itself, which is needed
    // for UI rendering purposes.
    return Object.assign({}, proxy(delegate), proxy(this));
  }

  componentWillReceiveProps(props) {
    if (props.dataSource !== this.props.dataSource) {
      this.state.dataSource.teardown();
      let dataSource = this.getDataSource(props);
      let delegate = this.getDelegate(props, dataSource);
      this.setState({
        dataSource,
        delegate
      });
    } else {
      this.state.dataSource.updateItemStates(props);
    }
  }

  componentWillUnmount() {
    this.state.dataSource.teardown();
  }

  render() {
    const {
      selectedItems,
      className,
      id = this.treeId,
      allowsSelection,
      allowsEmptySelection,
      allowsMultipleSelection
    } = this.props;
    let {dataSource} = this.state;

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
        delegate={this.state.delegate}
        dataSource={dataSource}
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

  indentationForItem(section, index) {
    let content = this.collection.getItem(section, index);
    return 28 * content.level;
  }

  onKeyDown(e) {
    const {dataSource} = this.state;
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

  _onToggleItem(item, isExpanded) {
    if (!this.props.onToggleItem) {
      return;
    }

    let treeItem = this.state.dataSource._getItem(item);
    if (treeItem && treeItem.isToggleable && treeItem.hasChildren && treeItem.isExpanded !== isExpanded) {
      let expandedItems = this.state.dataSource.getExpandedItems();
      if (isExpanded) {
        expandedItems.push(treeItem);
      } else {
        expandedItems = expandedItems.filter(i => i !== item);
      }

      this.props.onToggleItem(treeItem.item, isExpanded, expandedItems);
    }
  }

  /**
   * Expands or collapses the given item depending on its current state.
   * @param {object} item
   */
  async toggleItem(item) {
    let treeItem = this.state.dataSource._getItem(item);
    this._onToggleItem(item, !treeItem.isExpanded);

    if (!this.props.expandedItems) {
      await this.state.dataSource.toggleItem(item);
    }
  }

  /**
   * Expands the given item, displaying all of its children.
   * @param {object} item
   */
  expandItem(item) {
    this._onToggleItem(item, true);

    if (!this.props.expandedItems) {
      this.state.dataSource.expandItem(item);
    }
  }

  /**
   * Collapses the given item, hiding all of its children.
   * @param {object} item
   */
  collapseItem(item) {
    this._onToggleItem(item, false);

    if (!this.props.expandedItems) {
      this.state.dataSource.collapseItem(item);
    }
  }

  selectItem(item) {
    let indexPath = this.state.dataSource.indexPathForItem(item);
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

  onSelectionChange() {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this.selectedItems);
    }
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
