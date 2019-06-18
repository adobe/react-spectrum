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

import Checkbox from '../../Checkbox';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import focusRing from '../../utils/focusRing';
import React from 'react';

/*
 * A wrapper for an Item within an ItemColumn that will manage the Item's state
 */
@focusRing
export default class Item extends React.Component {
  focus() {
    if (this.itemRef) {
      this.itemRef.focus();
    }
  }

  render() {
    let {
      item,
      renderItem,
      selected: highlighted, // selected comes from collection-view, but is really highlighted
      allowsSelection,
      allowsBranchSelection,
      isSelected,
      focused,
      column,
      level = 0,
      detailNode,
      collectionView,
      ...props
    } = this.props;

    let className = classNames('spectrum-AssetList-item', {
      'is-selectable': allowsBranchSelection,
      'is-branch': item.hasChildren,
      'is-navigated': highlighted && !isSelected,
      'is-selected': isSelected
    });

    let id = item.getItemId();
    let labelId = `${id}-label`;
    let columnFocused = column && column.props.focused;
    let tabIndex = columnFocused && focused ? 0 : -1;
    if (columnFocused && !focused && collectionView && !collectionView.focusedIndexPath) {
      tabIndex = 0;
    }

    let setSize = item.parent.children.getSectionLength(0);
    let isExpanded = item.hasChildren ? (highlighted || false) : null;
    let ownedColumnId = isExpanded || detailNode === item ? item.getColumnId() : null;
    let ariaDescribedby = detailNode === item ? ownedColumnId : null;

    return (
      <div
        ref={i => this.itemRef = i}
        id={id}
        tabIndex={tabIndex}
        role="treeitem"
        aria-selected={allowsSelection && (allowsBranchSelection || !item.hasChildren) ? (isSelected || false) : null}
        aria-level={level + 1}
        aria-posinset={item.index + 1}
        aria-setsize={setSize}
        aria-expanded={isExpanded}
        aria-labelledby={labelId}
        aria-describedby={ariaDescribedby}
        aria-owns={ownedColumnId}
        className={className}
        {...filterDOMProps(props)}>
        {allowsSelection && allowsBranchSelection && this.renderCheckbox(labelId)}
        <span role="presentation" className="spectrum-AssetList-itemLabel" id={labelId}>{renderItem(item.item, item)}</span>
        {item.hasChildren && this.renderChevron()}
        {allowsSelection && !allowsBranchSelection && !item.hasChildren && this.renderCheckbox()}
      </div>
    );
  }

  renderChevron() {
    return (
      <ChevronRightMedium className="spectrum-AssetList-itemChildIndicator" size="XS" />
    );
  }

  renderCheckbox(labelId) {
    let {
      isSelected,
      onSelect
    } = this.props;

    return (
      <Checkbox
        aria-hidden="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="spectrum-AssetList-itemSelector"
        onMouseDown={e => e.stopPropagation()}
        onFocus={e => {
          e.preventDefault();
          this.focus();
        }}
        checked={isSelected}
        onChange={onSelect} />
    );
  }
}
