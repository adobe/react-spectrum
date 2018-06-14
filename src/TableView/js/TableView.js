import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {EditableCollectionView} from '@react/collection-view';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import TableCell from './TableCell';
import TableRow from './TableRow';
import TableViewLayout from './TableViewLayout';
import '../style/index.styl';

importSpectrumCSS('table');

@autobind
export default class TableView extends Component {
  static propTypes = {
    /** The datasource for the column view. Should be a subclass of `TableViewDataSource`. */
    dataSource: PropTypes.object.isRequired,

    /** A function which renders a cell. Passed a column object and cell data. */
    renderCell: PropTypes.func.isRequired,

    /** An optional function which overrides the rendering for a column header. Passed the column object. */
    renderColumnHeader: PropTypes.func,

    /** Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /** Whether to allow multiple selection of items */
    allowsMultipleSelection: PropTypes.bool,

    /** A function that is called when the selection changes. Passed an IndexPathSet object. */
    onSelectionChange: PropTypes.func,

    /** Sets the selected rows. Should be an IndexPathSet object or an array of IndexPaths. */
    selectedIndexPaths: PropTypes.object,

    /** A function that is called when a cell is clicked. Passed a column object and row index. */
    onCellClick: PropTypes.func,

    /* A function that is called when a cell is double clicked. Passed a column object and row index. */
    onCellDoubleClick: PropTypes.func,

    /** Whether to use the spectrum quiet variant. */
    quiet: PropTypes.bool,

    /** The height each row should be in the table. It has a maximum of 72 */
    rowHeight: PropTypes.number
  };

  static defaultProps = {
    allowsSelection: true
  };

  constructor(props) {
    super(props);
    const rowHeight = Math.max(48, Math.min(72, props.rowHeight));
    this.layout = new TableViewLayout({rowHeight});
  }

  setSelectAll(select) {
    if (select) {
      this.collection.selectAll();
    } else {
      this.collection.clearSelection();
    }
  }

  renderHeader() {
    // TODO: compute selected based on whether everything is really selected
    return (
      <TableRow
        isHeaderRow
        columns={this.props.dataSource.columns}
        renderCell={this.renderColumnHeader}
        allowsSelection={this.props.allowsSelection}
        selected={null}
        onSelectChange={this.setSelectAll}
        onCellClick={this.sortByColumn} />
    );
  }

  renderItemView(type, data) {
    return (
      <TableRow
        columns={this.props.dataSource.columns}
        renderCell={this.renderCell.bind(this, data)}
        allowsSelection={this.props.allowsSelection}
        onCellClick={this.props.onCellClick}
        onCellDoubleClick={this.props.onCellDoubleClick} />
    );
  }

  renderColumnHeader(column) {
    return (
      <TableCell
        isHeaderRow
        column={column}
        sortDir={this.props.dataSource.sortColumn === column && this.props.dataSource.sortDir}>
        {this.props.renderColumnHeader ? this.props.renderColumnHeader(column) : column.title}
      </TableCell>
    );
  }

  renderCell(data, column, i) {
    return (
      <TableCell column={column}>
        {this.props.renderCell(column, data[i])}
      </TableCell>
    );
  }

  sortByColumn(column) {
    if (column.sortable) {
      this.props.dataSource._sortByColumn(column);
      this.forceUpdate();
    }
  }

  onSelectionChange() {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this.collection.selectedIndexPaths);
    }
  }

  onScroll() {
    let scrollOffset = this.collection.contentHeight - this.collection.size.height * 2;
    if (this.collection.contentOffset > scrollOffset) {
      this.collection.dataSource.loadMore();
    }
  }

  render() {
    var tableClasses = classNames(
      this.props.className,
      'react-spectrum-TableView',
      'spectrum-Table', {
        'spectrum-Table--quiet': this.props.quiet
      }
    );
    return (
      <div className={tableClasses}>
        {this.renderHeader()}
        <EditableCollectionView
          className="react-spectrum-TableView-body spectrum-Table-body"
          delegate={this}
          layout={this.layout}
          dataSource={this.props.dataSource}
          ref={c => this.collection = c}
          canSelectItems={this.props.allowsSelection}
          allowsMultipleSelection={this.props.allowsMultipleSelection}
          selectionMode="toggle"
          selectedIndexPaths={this.props.selectedIndexPaths}
          onSelectionChanged={this.onSelectionChange}
          onScroll={this.onScroll} />
      </div>
    );
  }
}
