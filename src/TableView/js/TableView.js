import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {EditableCollectionView, IndexPath, IndexPathSet} from '@react/collection-view';
import ListDataSource from '../../ListDataSource';
import PropTypes from 'prop-types';
import Provider from '../../Provider';
import proxy from '../../utils/proxyObject';
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
    acceptsDrops: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)])
  };

  static defaultProps = {
    allowsSelection: true,
    allowsMultipleSelection: true,
    canDragItems: false,
    acceptsDrops: false
  };

  // These come from the parent Provider. Used to set the correct props
  // to the provider that wraps the drag view.
  static contextTypes = {
    theme: PropTypes.string,
    scale: PropTypes.string,
    locale: PropTypes.string
  };

  static SORT_ASCENDING = 1;
  static SORT_DESCENDING = -1;

  constructor(props) {
    super(props);
    this.tableViewId = createId();
    const rowHeight = Math.max(48, Math.min(72, props.rowHeight));
    this.layout = new TableViewLayout({rowHeight, tableView: this});
    this.isLoading = false;
    this.hasMore = true;
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
  }

  async componentDidMount() {
    await this.performLoad(() =>
      this.props.dataSource.performLoad(this.state.sortDescriptor)
    );
  }

  componentWillReceiveProps(props) {
    if (props.columns && props.columns !== this.props.columns) {
      this.setState({
        columns: this.props.columns
      });
    }
    
    if (props.sortDescriptor && props.sortDescriptor !== this.props.sortDescriptor) {
      this.updateSort(props.sortDescriptor);
    }
  }

  async performLoad(fn) {
    if (this.isLoading) {
      return;
    }

    try {
      this.isLoading = true;
      if (this.collection) {
        this.collection.relayout();
      }

      await fn();
    } finally {
      this.isLoading = false;
      if (this.collection) {
        this.collection.relayout();
      }
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
          collectionView={this.collection} />
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
        collectionView={this.collection} />
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
      <TableCell column={column} aria-colindex={columnIndex} rowFocused={rowFocused}>
        {this.props.renderCell(column, data, rowFocused)}
      </TableCell>
    );
  }

  renderDragView(target) {
    // Use custom drag renderer if provided,
    // otherwise just get the existing row view.
    let dragView;
    if (this.props.renderDragView) {
      dragView = this.props.renderDragView(target, this.collection.selectedIndexPaths);
    } else {
      // Get the row wrapper view from collection-view. The first child is the actual TableRow component.
      let view = this.collection.getItemView(target.indexPath);
      dragView = [...view.children][0];
    }

    // Wrap in a spectrum provider so spectrum components are themed correctly.
    return (
      <Provider {...this.context}>
        {dragView}
      </Provider>
    );
  }

  renderSupplementaryView(type) {
    if (type === 'loading-indicator') {
      return <Wait centered size="M" />;
    }

    if (type === 'empty-view' && this.props.renderEmptyView) {
      return this.props.renderEmptyView();
    }

    return <div />;
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
        await this.updateSort(sortDescriptor);
      }
    }
  }

  async updateSort(sortDescriptor) {
    this.setState({sortDescriptor});
    await this.performLoad(() =>
      this.props.dataSource.performSort(sortDescriptor)
    );
  }

  onScroll() {
    let scrollOffset = this.collection.contentSize.height - this.collection.size.height * 2;
    if (this.hasMore && this.collection.contentOffset.y > scrollOffset) {
      this.performLoad(async () => {
        let res = await this.props.dataSource.performLoadMore();
        if (typeof res === 'boolean') {
          this.hasMore = res;
        }
      });
    }
  }

  onSelectionChange() {
    // Force update to properly set the state of the Select All checkbox
    this.forceUpdate();

    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this.collection.selectedIndexPaths);
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

  render() {
    const {
      allowsMultipleSelection,
      allowsSelection,
      className,
      dataSource,
      id = this.tableViewId,
      quiet,
      selectedIndexPaths,
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
        <EditableCollectionView
          {...this.props}
          className="react-spectrum-TableView-body spectrum-Table-body"
          delegate={Object.assign({}, proxy(this), proxy(dataSource))}
          layout={this.layout}
          dataSource={dataSource}
          ref={c => this.collection = c}
          canSelectItems={allowsSelection}
          allowsMultipleSelection={allowsMultipleSelection}
          selectionMode="toggle"
          keyboardMode="focus"
          selectedIndexPaths={selectedIndexPaths}
          onSelectionChanged={this.onSelectionChange}
          onScroll={this.onScroll}
          role="rowgroup" />
      </div>
    );
  }
}
