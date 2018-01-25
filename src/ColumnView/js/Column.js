import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {CSSLayout, EditableCollectionView, IndexPath} from '@react/collection-view';
import Item from './Item';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * An individual column in a ColumnView
 */
@autobind
export default class Column extends React.Component {
  constructor(props) {
    super(props);

    this.layout = new CSSLayout({
      sectionStyle: {
        flexDirection: 'column',
        flexWrap: 'nowrap'
      },
      itemStyle: {
        height: 44
      },
      transitionStyle: {
        opacity: 0
      }
    });
  }

  render() {
    // Find IndexPaths for the items that should be highlighted.
    // If this is the last column, nothing should be highlighted.
    // Otherwise, highlight the navigated item in that column.
    // Multi-select behavior is handled internally by the collection-view. See onHighlightChange.
    let highlightedIndexPaths = [];
    let stack = this.props.dataSource.navigationStack;
    if (stack[stack.length - 1] !== this.props.item) {
      // Find the index of the navigated child (which should be next in the stack).
      let index = stack.indexOf(this.props.item);
      let navigatedItem = stack[index + 1];
      if (navigatedItem) {
        highlightedIndexPaths.push(new IndexPath(0, this.props.item.children.sections[0].indexOf(navigatedItem)));
      }
    }

    return (
      <EditableCollectionView
        className={classNames('spectrum-MillerColumn')}
        dataSource={this.props.item.children}
        layout={this.layout}
        delegate={this}
        onSelectionChanged={this.onHighlightChange}
        selectedIndexPaths={highlightedIndexPaths}
        allowsMultipleSelection={this.props.allowsSelection}
        ref={c => this.collection = c}
        onKeyDown={this.onKeyDown} />
    );
  }

  onHighlightChange() {
    // If there is 1 item highlighted, navigate to it.
    // If there are no items highlighted, navigate to the parent.
    // Otherwise, do nothing and let the collection-view manage the multiple highlighting behavior.
    let highlighted = Array.from(this.collection.selectedIndexPaths);
    if (highlighted.length <= 1) {
      let item = highlighted.length === 1 ? this.collection.getItem(highlighted[0]) : this.props.item;
      this.props.dataSource.navigateToItem(item.item);
    }
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        return this.commitSelection();

      case 'ArrowLeft':
        return this.props.dataSource.navigateToPrevious();

      case 'ArrowRight':
        return this.props.dataSource.navigateToNext();
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
    return (
      <Item
        item={item}
        renderItem={this.props.renderItem}
        allowsSelection={this.props.allowsSelection}
        allowsBranchSelection={this.props.allowsBranchSelection}
        isSelected={this.props.dataSource.isSelected(item.item)}
        onSelect={this.onSelect.bind(this, item.item)} />
    );
  }

  onSelect(item, selected) {
    this.props.dataSource.setSelected([item], selected);
  }
}
