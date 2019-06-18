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

import {ArrayDataSource, IndexPath} from '@react/collection-view';

// symbol + counter for requests
let REQUEST_ID = 1;
let LAST_REQUEST = Symbol('lastRequest');

/**
 * ListDataSource is a common data source used by views that load a list of data.
 * It supports async loading, infinite scrolling, and sorting data.
 * Used by TableView and GridView.
 */
export default class ListDataSource extends ArrayDataSource {
  constructor(props) {
    super(props);
    this[LAST_REQUEST] = 0;
  }
  /**
   * Called on initial load to get the initial items to display,
   * which are inserted into a single section. Should be overridden to return an array of items.
   * If you need to load multiple sections of data, override `performLoad` instead.
   * @abstract
   * @param {?object} sortDescriptor - When called by a TableView, contains the sort column and direction
   * @return {Array}
   */
  async load(sortDescriptor) {}

  /**
   * Called when scrolling near the bottom of a list. You can use this
   * opportunity to load more data, e.g. for infinite scrolling. The array of
   * items you return will be appended to the last section.
   * If you need to load multiple sections of data, override `performLoadMore` instead.
   * @abstract
   * @return {Array}
   */
  async loadMore() {}

  /**
   * Triggers loading of data. You should call `insertSection` or `insertItems`
   * as needed to add the loaded data into view. By default, calls `load` to get
   * data for a single section.
   * @param {?object} sortDescriptor - When called by a TableView, contains the sort column and direction
   */
  async performLoad(sortDescriptor) {
    let requestId = REQUEST_ID++;
    this[LAST_REQUEST] = requestId;
    this.clear(false);

    let items = await this.load(sortDescriptor);
    // insert items only if it's the last request that's been made
    if (this[LAST_REQUEST] === requestId && items) {
      this.insertSection(0, items.slice(), false);
    }
  }

  /**
   * Triggers a reload of the data in the attached view. Will cause the contents of the view
   * to be cleared and `performLoad` to be called again. You should not call `performLoad`
   * directly since that will not allow the view an opportunity to display its loading spinner.
   */
  reloadData() {
    this.emit('reloadData');
  }

  /**
   * Triggers loading of more data when when scrolling near the bottom of a list.
   * You should call `insertSection` or `insertItems` as needed to add the loaded data into view.
   * Returns whether more data was successfully inserted. If you return false, the view will
   * assume that all data has already been loaded and will stop calling `performLoadMore`.
   * By default, calls `loadMore` to get data for a single section.
   * @abstract
   * @return {boolean} - Whether more data was inserted.
   */
  async performLoadMore() {
    let requestId = REQUEST_ID++;
    this[LAST_REQUEST] = requestId;

    let items = await this.loadMore();
    if (items && items.length > 0) {
      if (this[LAST_REQUEST] === requestId) {
        this.insertItems(new IndexPath(0, this.sections[this.sections.length - 1].length), items.slice(), false);
      }
      return true;
    }

    return false;
  }

  /**
   * Performs sorting of the data. By default, calls `performLoad` to reload the data
   * with the new sort descriptor.
   * @param {object} sortDescriptor - Contains the sort column and direction
   */
  async performSort(sortDescriptor) {
    await this.performLoad(sortDescriptor);
  }
}
