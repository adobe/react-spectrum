import {DataSource} from '@react/collection-view';

/*
 * TableViewDataSource is the super class for all data sources used by TableView.
 * @deprecated
 */
export default class TableViewDataSource extends DataSource {
  constructor() {
    super();
    console.warn('TableViewDataSource is deprecated and will be removed in the next major version of react-spectrum. Please switch to the new TableView API using ListDataSource. See http://react-spectrum.corp.adobe.com/components/TableView for details.');
    this.columns = this.getColumns();
    this.sortColumn = null;
    this.sortDir = -1;
  }

  getNumberOfSections() {
    return 1;
  }

  getSectionLength(section) {
    return this.getNumberOfRows(section);
  }

  getItem(section, index) {
    return this.columns.map(column => this.getCell(column, index, section));
  }

  /**
   * Returns a list of columns in the TableView
   * @return {object[]}
   * @abstract
   */
  getColumns() {
    throw new Error('getColumns must be implemented by subclasses');
  }

  /**
   * Returns the number of rows in the TableView
   * @return {number}
   * @abstract
   */
  getNumberOfRows(section) {
    throw new Error('getNumberOfRows must be implemented by subclasses');
  }

  /**
   * Returns the data for a cell in the TableView
   * @return {any}
   * @abstract
   */
  getCell(column, row, section) {
    throw new Error('getCell must be implemented by subclasses');
  }

  getSectionHeader(section) {
    return null;
  }

  async performSort(sortDescriptor) {
    this.sortColumn = sortDescriptor.column;
    this.sortDir = sortDescriptor.direction;
    this.sort(this.sortColumn, this.sortDir);
  }

  async performLoad() {
    // For compatibility with the new ListDataSource API.
  }
  
  async performLoadMore() {
    await this.loadMore();
  }

  /**
   * Called by the TableView when scrolling near the bottom. You can use this
   * opportunity to load more data, e.g. for infinite scrolling.
   * @abstract
   */
  async loadMore() {
    // if you want infinite scrolling, override this with your logic
  }

  /**
   * Called by the TableView when a column header is clicked. You should sort your data
   * accordingly and call `reloadData`.
   * @param {object} column
   * @param {number} dir
   * @abstract
   */
  sort(column, dir) {
    throw new Error('sort must be implemented by subclasses');
  }

  /**
   * Reloads the data in the TableView
   */
  reloadData() {
    this.emit('reloadSection', 0, false);
  }
}
