import autobind from 'autobind-decorator';
import classNames from 'classnames';
import CollectionView from '../../utils/CollectionView';
import createId from '../../utils/createId';
import {IndexPath, IndexPathSet} from '@react/collection-view';
import ListDataSource from '../../ListDataSource';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import TableCell from './TableCell';
import TableRow from './TableRow';
import TableViewDataSource from './TableViewDataSource';
import TableViewLayout from './TableViewLayout';
import Wait from '../../Wait';
import '../style/index.styl';

importSpectrumCSS('table');

const columnShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  sortable: PropTypes.bool,
  width: PropTypes.number,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  // resizable: PropTypes.bool,
  divider: PropTypes.bool,
  align: PropTypes.oneOf(['left', 'center', 'right'])
});

const sortDescriptorShape = PropTypes.shape({
  column: columnShape.isRequired,
  direction: PropTypes.oneOf([-1, 1]).isRequired
});

@autobind
export default class TableView extends Component {
  static propTypes = {
    /** The columns to display in the table view (controlled). */
    columns: PropTypes.arrayOf(columnShape),

    /** The initial columns to display in the table view (uncontrolled). */
    defaultColumns: PropTypes.arrayOf(columnShape),

    /** The datasource for the table view. Should be a subclass of `ListDataSource`. */
    dataSource: PropTypes.instanceOf(ListDataSource).isRequired,

    /** A function which renders a cell. Passed a column object and cell data. */
    renderCell: PropTypes.func.isRequired,

    /** An optional function which overrides the rendering for a column header. Passed the column object. */
    renderColumnHeader: PropTypes.func,

    /** An optional function which is called to render the contents of the table body when there are no rows. */
    renderEmptyView: PropTypes.func,

    /** Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /** Whether to allow multiple selection of items */
    allowsMultipleSelection: PropTypes.bool,

    /** A function that is called when the selection changes. Passed an IndexPathSet object. */
    onSelectionChange: PropTypes.func,

    /** Sets the selected rows. Should be an IndexPathSet object or an array of IndexPaths. */
    selectedIndexPaths: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.instanceOf(IndexPath)),
      PropTypes.instanceOf(IndexPathSet)
    ]),

    /** The sort column and direction (controlled). */
    sortDescriptor: sortDescriptorShape,

    /** The initial sort column and direction (uncontrolled). */
    defaultSortDescriptor: sortDescriptorShape,

    /** A function that is called when the sort descriptor changes. */
    onSortChange: PropTypes.func,

    /** A function that is called when a cell is clicked. Passed a column object and row index. */
    onCellClick: PropTypes.func,

    /* A function that is called when a cell is double clicked. Passed a column object and row index. */
    onCellDoubleClick: PropTypes.func,

    /** Whether to use the spectrum quiet variant. */
    quiet: PropTypes.bool,

    /** The height each row should be in the table. It has a maximum of 72 */
    rowHeight: PropTypes.number,

    /** Whether the user can drag rows from the table. */
    canDragItems: PropTypes.bool,

    /** A function which renders the view to display under the cursor during drag and drop. */
    renderDragView: PropTypes.func,

    /**
     * Whether the TableView accepts drops.
     * If `true`, the table accepts all types of drops. Alternatively,
     * it can be set to an array of accepted drop types.
     */
    acceptsDrops: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),

    /**
     * Whether drops should appear on top of rows, or between them. If you want to customize this
     * or mix the modes, you can override `getDropTarget` on the data source.
     */
    dropPosition: PropTypes.oneOf(['on', 'between'])
  };

  static defaultProps = {
    allowsSelection: true,
    allowsMultipleSelection: true,
    canDragItems: false,
    acceptsDrops: false,
    dropPosition: 'between'
  };

  static SORT_ASCENDING = 1;
  static SORT_DESCENDING = -1;

  constructor(props) {
    super(props);
    this.tableViewId = createId();
    const rowHeight = Math.max(48, Math.min(72, props.rowHeight));
    this.layout = new TableViewLayout({rowHeight});
    this.state = {
      columns: this.props.columns ||
        this.props.defaultColumns ||
        this.props.dataSource.getColumns(),
      sortDescriptor: this.props.sortDescriptor ||
        this.props.defaultSortDescriptor ||
        (this.props.dataSource.sortColumn && { // backward compatibility
          column: this.props.dataSource.sortColumn,
          direction: this.props.dataSource.sortDirection
        })
    };
    this.focusedColumnIndex = null;
  }

  componentWillReceiveProps(props) {
    if (props.columns && props.columns !== this.props.columns) {
      this.setState({
        columns: this.props.columns
      });
    }

    if (props.sortDescriptor && props.sortDescriptor !== this.props.sortDescriptor) {
      this.setState({sortDescriptor: props.sortDescriptor});
    }
  }

  setSelectAll(select) {
    if (select) {
      this.collection.selectAll();
    } else {
      this.collection.clearSelection();
    }
  }

  renderHeader() {
    const {
      id = this.tableViewId,
      allowsMultipleSelection,
      allowsSelection
    } = this.props;

    let numRows = this.getRowCount();
    let allItemsSelected = this.collection && this.collection.selectedIndexPaths.length === numRows && numRows > 0;

    return (
      <div role="rowgroup">
        <TableRow
          tableId={id}
          isHeaderRow
          columns={this.state.columns}
          renderCell={this.renderColumnHeader}
          allowsMultipleSelection={allowsSelection && allowsMultipleSelection}
          allowsSelection={allowsSelection}
          selected={allItemsSelected}
          onSelectChange={this.setSelectAll}
          onCellClick={this.sortByColumn}
          onCellFocus={this.onCellFocus}
          collectionView={this.collection}
          tableView={this}
          ref={row => this.headerRowRef = row} />
      </div>
    );
  }

  renderItemView(type, data) {
    const {
      id = this.tableViewId,
      allowsMultipleSelection,
      allowsSelection,
      onCellClick,
      onCellDoubleClick
    } = this.props;
    return (
      <TableRow
        tableId={id}
        columns={this.state.columns}
        renderCell={this.renderCell.bind(this, data)}
        allowsMultipleSelection={allowsSelection && allowsMultipleSelection}
        allowsSelection={allowsSelection}
        onCellClick={onCellClick}
        onCellDoubleClick={onCellDoubleClick}
        onCellFocus={this.onCellFocus}
        collectionView={this.collection}
        tableView={this} />
    );
  }

  renderColumnHeader(column, columnIndex, rowFocused) {
    const {
      allowsSelection,
      allowsMultipleSelection,
      renderColumnHeader
    } = this.props;
    return (
      <TableCell
        isHeaderRow
        column={column}
        sortDir={(this.state.sortDescriptor && this.state.sortDescriptor.column === column) ? this.state.sortDescriptor.direction : null}
        allowsMultipleSelection={allowsSelection && allowsMultipleSelection}
        rowFocused={rowFocused}>
        {renderColumnHeader ? renderColumnHeader(column) : column.title}
      </TableCell>
    );
  }

  renderCell(data, column, columnIndex, rowFocused) {
    // For backwards compatibility with TableViewDataSource, support
    // getting per-cell data instead of per-row data.
    if (this.props.dataSource instanceof TableViewDataSource) {
      data = data[columnIndex];
    }

    return (
      <TableCell column={column} rowFocused={rowFocused}>
        {this.props.renderCell(column, data, rowFocused)}
      </TableCell>
    );
  }

  renderSupplementaryView(type) {
    const {allowsSelection, renderEmptyView} = this.props;
    let colCount = this.state.columns.length;
    if (allowsSelection) {
      colCount += 1;
    }
    if (type === 'loading-indicator') {
      return <div role="row"><div role="gridcell" aria-colspan={colCount}><Wait centered size="M" /></div></div>;
    }

    if (type === 'empty-view' && renderEmptyView) {
      return <div role="row"><div role="gridcell" aria-colspan={colCount}>{renderEmptyView()}</div></div>;
    }

    if (type === 'insertion-indicator') {
      return <div role="row" className="react-spectrum-TableView-insertionIndicator"><div role="gridcell" aria-colspan={colCount} /></div>;
    }

    return <div role="presentation" />;
  }

  async sortByColumn(column) {
    if (column.sortable) {
      let dir = TableView.SORT_ASCENDING;
      if (this.state.sortDescriptor && this.state.sortDescriptor.column === column) {
        dir = -this.state.sortDescriptor.direction;
      }

      let sortDescriptor = {
        column: column,
        direction: dir
      };

      if (this.props.onSortChange) {
        this.props.onSortChange(sortDescriptor);
      }

      if (!('sortDescriptor' in this.props)) {
        this.setState({sortDescriptor});
      }
    }
  }

  onSelectionChange(selectedIndexPaths) {
    // Force update to properly set the state of the Select All checkbox
    this.forceUpdate();

    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(selectedIndexPaths);
    }
  }

  getRowCount() {
    let dataSource = this.props.dataSource;
    let count = 0;
    let numSections = dataSource.getNumberOfSections();
    for (let section = 0; section < numSections; section++) {
      count += dataSource.getSectionLength(section);
    }

    return count;
  }

  onCellFocus(columnIndex, e) {
    this.focusedColumnIndex = columnIndex;
  }

  render() {
    const {
      allowsMultipleSelection,
      allowsSelection,
      className,
      dataSource,
      id = this.tableViewId,
      quiet,
      ...otherProps
    } = this.props;
    const tableClasses = classNames(
      className,
      'react-spectrum-TableView',
      'spectrum-Table', {
        'spectrum-Table--quiet': quiet
      }
    );
    const rowCount = this.getRowCount(0) + 1;
    let colCount = this.state.columns.length;
    if (allowsSelection) {
      colCount += 1;
    }
    return (
      <div
        id={id}
        className={tableClasses}
        role="grid"
        aria-rowcount={rowCount}
        aria-colcount={colCount}
        aria-label={otherProps['aria-label']}
        aria-labelledby={otherProps['aria-labelledby']}
        aria-describedby={otherProps['aria-describedby']}
        aria-multiselectable={(allowsSelection && allowsMultipleSelection) || null}>
        {this.renderHeader()}
        <CollectionView
          {...this.props}
          ref={c => this.collection = c ? c.collection : null}
          role="rowgroup"
          className="spectrum-Table-body react-spectrum-TableView-body"
          layout={this.layout}
          dataSource={dataSource}
          renderItemView={this.renderItemView}
          renderSupplementaryView={this.renderSupplementaryView}
          canSelectItems={allowsSelection}
          allowsMultipleSelection={allowsMultipleSelection}
          sortDescriptor={this.state.sortDescriptor}
          selectionMode="toggle"
          keyboardMode="focus"
          onSelectionChanged={this.onSelectionChange} />
      </div>
    );
  }
}
