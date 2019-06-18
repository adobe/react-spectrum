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

import {LayoutInfo, Rect} from '@react/collection-view';

/*
 * Adds support for a loading spinner and empty views to a collection-view layout
 */
export default function loadingLayout(layout) {
  let {getLayoutInfo, getVisibleLayoutInfos, validate, getContentSize} = layout;

  let emptyView = null;
  let loadingIndicator = null;

  layout.getLayoutInfo = function (type, section, index) {
    if (type === 'empty-view') {
      return emptyView;
    }

    if (type === 'loading-indicator') {
      return loadingIndicator;
    }

    return getLayoutInfo.call(this, type, section, index);
  };

  layout.getVisibleLayoutInfos = function (rect) {
    let layoutInfos = getVisibleLayoutInfos.call(this, rect);
    if (emptyView) {
      layoutInfos.push(emptyView);
    }

    if (loadingIndicator) {
      layoutInfos.push(loadingIndicator);
    }

    return layoutInfos;
  };

  layout.validate = function (invalidationContext) {
    validate.call(this, invalidationContext);

    let count = this.collectionView.getSectionLength(0);

    let isLoading = this.component.isLoading;
    if (isLoading) {
      loadingIndicator = new LayoutInfo('loading-indicator');

      if (count === 0) {
        loadingIndicator.rect = new Rect(0, 0, this.collectionView.size.width, this.collectionView.size.height);
      } else {
        loadingIndicator.rect = new Rect(0, getContentSize.call(this).height, this.collectionView.size.width, 100);
      }
    } else {
      loadingIndicator = null;

      if (count === 0) {
        emptyView = new LayoutInfo('empty-view');
        emptyView.rect = new Rect(0, 0, this.collectionView.size.width, this.collectionView.size.height);
      } else {
        emptyView = null;
      }
    }
  };

  layout.getContentSize = function () {
    let size = getContentSize.call(this);
    let count = this.collectionView.getSectionLength(0);

    if (loadingIndicator && count > 0) {
      size.height += loadingIndicator.rect.height;
    }

    return size;
  };

  return layout;
}
