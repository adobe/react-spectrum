import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {EditableCollectionView} from '@react/collection-view';
import React, {Component, PropTypes} from 'react';
import TableCell from './TableCell';
import TableRow from './TableRow';
import TableViewLayout from './TableViewLayout';
import '../../Table/style/index.styl';
import '../style/index.styl';

@autobind
export default class TableView extends Component {
  static propTypes = {
    /* The datasource for the column view. Should be a subclass of TableViewDataSource. */
    dataSource: PropTypes.object.isRequired,

    /* A function which renders a cell. Passed a column object and cell data. */
    renderCell: PropTypes.func.isRequired,

    /* An optional function which overrides the rendering for a column header. Passed the column object. */
    renderColumnHeader: PropTypes.func,

    /* Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /* Whether to allow multiple selection of items */
    allowsMultipleSelection: PropTypes.bool,

    /* A function that is called when the selection changes. Passed an IndexPathSet object. */
    onSelectionChange: PropTypes.func,

    /* Sets the selected rows. Should be an IndexPathSet object or an array of IndexPaths. */
    selectedIndexPaths: PropTypes.object,

    /* A function that is called when a cell is clicked. Passed a column object and row index. */
    onCellClick: PropTypes.func,

    /* Whether to use the spectrum quiet variant. */
    quiet: PropTypes.bool
  };

  static defaultProps = {
    allowsSelection: true
  };

  constructor() {
    super();
    this.layout = new TableViewLayout;
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
        onCellClick={this.props.onCellClick} />
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
          onSelectionChanged={this.onSelectionChange} />
      </div>
    );
  }
}
