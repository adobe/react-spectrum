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
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import createId from '../../utils/createId';
import focusRing from '../../utils/focusRing';
import React from 'react';
import VisuallyHidden from '../../VisuallyHidden';

@autobind
@focusRing
export default class TreeItem extends React.Component {
  constructor(props) {
    super(props);
    this.itemId = createId();
  }

  /**
   * Sets focus to the TreeItem DOM element.
   */
  focus() {
    if (this.treeitem) {
      this.treeitem.focus();
    }
  }

  getOwnedChildIds() {
    const {
      content,
      collectionView,
      treeId = this.itemId
    } = this.props;

    const {
      hasChildren,
      children,
      isExpanded,
      level = 0
    } = content;

    let ownedChildIds = null;

    if (hasChildren && isExpanded && children && children.length > 0) {
      // Filter visible views to only items that are children of this item, and generate ids
      ownedChildIds = collectionView.visibleViews
        .filter(view => view.content.parent === content)
        .sort((a, b) => a.content.index - b.content.index)
        .map(view => `${treeId}-${level + 1}-${view.content.index}`)
        .join(' ');
    }

    return !ownedChildIds || !ownedChildIds.length ? null : ownedChildIds;
  }

  onToggle(e) {
    let {content, onToggle} = this.props;
    if (onToggle) {
      onToggle(content.item, e);
    }

    requestAnimationFrame(() => this.focus());
  }

  stopPropagationAndPreventDefault(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  setTreeItemRef(t) {
    this.treeitem = t;
  }

  render() {
    let {
      content,
      renderItem,
      allowsSelection,
      selected,
      focused,
      collectionView,
      treeId = this.itemId,
      'drop-target': isDropTarget,
      onKeyDown
    } = this.props;

    let {
      item,
      hasChildren,
      isToggleable,
      isExpanded,
      parent,
      level = 0
    } = content;

    let itemClassName = classNames('spectrum-TreeView-item', {
      'is-open': isExpanded
    });

    let linkClassName = classNames('spectrum-TreeView-itemLink', {
      'is-selected': (allowsSelection && selected),
      'is-focused': focused,
      'is-drop-target': isDropTarget
    });

    let tabIndex = null;
    if (collectionView) {
      tabIndex = focused || !collectionView.focusedIndexPath ? 0 : -1;
    }

    let setSize = parent.children ? parent.children.length : 0;
    let posInSet = content.index;
    let id = `${treeId}-${level}-${posInSet}`;
    let ownedChildIds = this.getOwnedChildIds();

    return (
      <div className={itemClassName} role="presentation">
        <div
          className={linkClassName}
          ref={this.setTreeItemRef}
          id={id}
          role="treeitem"
          tabIndex={tabIndex}
          aria-selected={(allowsSelection ? selected : focused) || false}
          aria-expanded={hasChildren ? isExpanded : null}
          aria-level={level + 1}
          aria-setsize={setSize}
          aria-posinset={posInSet + 1}
          aria-owns={ownedChildIds ? `${id}-group` : null}
          onClick={!allowsSelection ? this.onToggle : null}
          onMouseDown={!allowsSelection ? this.stopPropagationAndPreventDefault : null}
          onKeyDown={onKeyDown}>
          {isToggleable && hasChildren &&
            <ChevronRightMedium
              className="spectrum-TreeView-indicator"
              size={null}
              onClick={allowsSelection ? this.onToggle : null}
              onMouseDown={this.stopPropagationAndPreventDefault} />
          }
          {renderItem(item, content)}
          {ownedChildIds &&
            <VisuallyHidden role="group" id={`${id}-group`} aria-labelledby={id} aria-owns={ownedChildIds} />
          }
        </div>
      </div>
    );
  }
}
