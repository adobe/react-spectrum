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

import React from 'react';
import ReactDOM from 'react-dom';

export default class GridItem extends React.Component {
  focus() {
    if (!this.cell) {
      return;
    }

    // If the cell provides a `focus` method, call it, otherwise find a DOM node to focus.
    if (typeof this.cell.focus === 'function') {
      this.cell.focus();
    } else {
      ReactDOM.findDOMNode(this.cell).focus();
    }
  }

  render() {
    let {selected, focused, layoutInfo, collectionView, size, allowsSelection} = this.props;
    let tabIndex = focused || !collectionView.focusedIndexPath ? 0 : -1;

    return (
      <div role="row" className="react-spectrum-GridView-item" aria-rowindex={layoutInfo.index + 1}>
        {React.cloneElement(this.props.children, {
          ref: (cell) => this.cell = cell,
          role: 'gridcell',
          tabIndex: tabIndex,
          'aria-selected': selected,
          allowsSelection,
          selected,
          focused,
          isDropTarget: this.props['drop-target'],
          onLoad: this.props.onLoad,
          variant: collectionView.layout.cardType,
          size: size
        })}
      </div>
    );
  }
}
