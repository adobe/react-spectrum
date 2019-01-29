import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {EditableCollectionView, IndexPath, ListLayout} from '@react/collection-view';
import Item from './Item';
import PropTypes from 'prop-types';
import React from 'react';

/*
 * An individual column in a ColumnView
 */
@autobind
export default class Column extends React.Component {
  static propTypes = {
    /*
     * An instance of an EventEmitter. Usually a ColumnViewDataSource.
     */
    dataSource: PropTypes.object,

    /*
     * Item to be rendered.
     */
    item: PropTypes.any,

    /*
     * Determines if a checkbox should be rendered.
     */
    allowsSelection: PropTypes.bool,

    /*
     * Determines if a checkbox should be rendered on chevron sections.
     */
    allowsBranchSelection: PropTypes.bool,

    /*
     * Custom rendering function for the item contents.
     */
    renderItem: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.layout = new ListLayout({
      rowHeight: 44
    });

    this.state = {
      highlightedIndexPaths: this.getHighlightedIndexPaths(props)
    };
  }

  getHighlightedIndexPaths(props) {
    // Find IndexPaths for the items that should be highlighted.
    // If this is the last column, nothing should be highlighted.
    // Otherwise, highlight the navigated item in that column.
    // Multi-select behavior is handled internally by the collection-view. See onHighlightChange.
    let highlightedIndexPaths = [];
    let {dataSource, level = 0} = props;
    let stack = dataSource.navigationStack;

    if (level !== stack.length - 1) {
      // Find the index of the navigated child (which should be next in the stack).
      let navigatedItem = stack[level + 1];
      if (navigatedItem) {
        highlightedIndexPaths.push(new IndexPath(0, navigatedItem.index));
      }
    }

    return highlightedIndexPaths;
  }

  componentWillReceiveProps(props) {
    this.setState({
      highlightedIndexPaths: this.getHighlightedIndexPaths(props)
    });
  }

  focus() {
    try {
      let indexPath = this.collection.selectedIndexPaths.firstIndexPath;
      this.collection.scrollToItem(indexPath);
      this.collection.focusItem(indexPath);
    } catch (err) {
      // ignore errors in tests
    }
  }

  onFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }

    // Ignore this focus event if it is the entire collection-view that is
    // focusing rather than an individual item.
    if (e.target === this.collection.getDOMNode()) {
      return;
    }

    // Wait until collection-view updates
    requestAnimationFrame(() => {
      // If the focused item is not selected, select it.
      let focusedIndexPath = this.collection && this.collection.focusedIndexPath;
      if (!this.collection.selectedIndexPaths.contains(focusedIndexPath)) {
        this.collection.selectItem(focusedIndexPath);
      }
    });
  }

  render() {
    let {
      item,
      allowsSelection,
      level = 0
    } = this.props;

    let ariaLabelledby = level > 0
      ? item.getItemId()
      : this.props['aria-labelledby'];

    return (
      <EditableCollectionView
        className={classNames('spectrum-MillerColumns-item spectrum-AssetList')}
        dataSource={item.children}
        layout={this.layout}
        delegate={this}
        onSelectionChanged={this.onHighlightChange}
        selectedIndexPaths={this.state.highlightedIndexPaths}
        allowsMultipleSelection={allowsSelection}
        ref={c => this.collection = c}
        role="group"
        id={item.getColumnId()}
        aria-label={this.props['aria-label']}
        aria-labelledby={ariaLabelledby}
        onKeyDown={this.onKeyDown}
        onFocus={this.onFocus} />
    );
  }

  onHighlightChange(highlightedIndexPaths) {
    if (!this.collection) {
      return;
    }

    // If there is 1 item highlighted, navigate to it.
    // If there are no items highlighted, navigate to the parent.
    // Otherwise, do nothing and let the collection-view manage the multiple highlighting behavior.
    let highlighted = Array.from(highlightedIndexPaths);
    if (highlighted.length <= 1) {
      let item = highlighted.length === 1 ? this.collection.getItem(highlighted[0]) : this.props.item;
      this.props.dataSource.navigateToItem(item.item);
    } else {
      this.setState({highlightedIndexPaths});
    }
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        return this.commitSelection();

      case 'ArrowLeft':
        return this.props.dataSource.navigateToPrevious();

      case 'ArrowRight':
        return this.props.dataSource.navigateToNext();

      case 'Escape':
      case 'Esc':
        e.preventDefault();
        return;
    }
  }

  commitSelection() {
    if (!this.props.allowsSelection) {
      return;
    }

    // Get highlighted items from the collection-view
    let highlighted = Array.from(this.collection.selectedIndexPaths)
        .map(indexPath => this.collection.getItem(indexPath));

    // Filter out branches if they cannot be selected
    if (!this.props.allowsBranchSelection) {
      highlighted = highlighted.filter(item => !item.hasChildren);
    }

    if (highlighted.length > 0) {
      // If all of the items have the same selection status, toggle it.
      // Otherwise, if some items are selected, and some not, select them all.
      let value = !highlighted.map(item => this.props.dataSource.isSelected(item.item))
        .reduce((prev, selected) => prev === selected ? prev : false);

      this.props.dataSource.setSelected(highlighted.map(h => h.item), value);
    }
  }

  renderItemView(type, item) {
    let {
      renderItem,
      allowsSelection,
      allowsBranchSelection,
      dataSource,
      detailNode,
      level
    } = this.props;
    return (
      <Item
        level={level}
        column={this}
        item={item}
        renderItem={renderItem}
        allowsSelection={allowsSelection}
        allowsBranchSelection={allowsBranchSelection}
        isSelected={dataSource.isSelected(item.item)}
        detailNode={detailNode}
        onSelect={this.onSelect.bind(this, item.item)} />
    );
  }

  onSelect(item, selected) {
    this.props.dataSource.setSelected([item], selected);
  }
}
