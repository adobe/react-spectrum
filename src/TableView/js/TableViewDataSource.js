import {DataSource} from '@react/collection-view';

export default class TableViewDataSource extends DataSource {
  constructor() {
    super();
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

  getColumns() {
    throw new Error('getColumns must be implemented by subclasses');
  }

  getNumberOfRows(section) {
    throw new Error('getNumberOfRows must be implemented by subclasses');
  }

  getCell(column, row, section) {
    throw new Error('getCell must be implemented by subclasses');
  }

  getSectionHeader(section) {
    return null;
  }

  _sortByColumn(column) {
    let dir = -1;
    if (this.sortColumn === column) {
      dir = -this.sortDir;
    }

    this.sortColumn = column;
    this.sortDir = dir;

    this.sort(column, this.sortDir);
  }

  sort(column, dir) {
    throw new Error('sort must be implemented by subclasses');
  }

  reloadData() {
    this.emit('reloadSection', 0, false);
  }
}
