import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {EditableCollectionView, ListLayout} from '@react/collection-view';
import PropTypes from 'prop-types';
import Provider from '../../Provider';
import React, {Component} from 'react';
import TableCell from './TableCell';
import TableRow from './TableRow';
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
    acceptsDrops: PropTypes.oneOf([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)])
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

  constructor(props) {
    super(props);
    this.tableViewId = createId();
    const rowHeight = Math.max(48, Math.min(72, props.rowHeight));
    this.layout = new ListLayout({rowHeight});
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
      allowsSelection,
      dataSource
    } = this.props;

    const allItemsSelected = this.collection && this.collection.selectedIndexPaths.length === dataSource.getNumberOfRows();

    return (
      <div role="rowgroup">
        <TableRow
          tableId={id}
          isHeaderRow
          columns={dataSource.columns}
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
      dataSource,
      onCellClick,
      onCellDoubleClick
    } = this.props;
    return (
      <TableRow
        tableId={id}
        columns={dataSource.columns}
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
      dataSource,
      renderColumnHeader
    } = this.props;
    return (
      <TableCell
        isHeaderRow
        column={column}
        sortDir={dataSource.sortColumn === column && dataSource.sortDir}
        allowsMultipleSelection={allowsSelection && allowsMultipleSelection}
        rowFocused={rowFocused}>
        {renderColumnHeader ? renderColumnHeader(column) : column.title}
      </TableCell>
    );
  }

  renderCell(data, column, columnIndex, rowFocused) {
    return (
      <TableCell column={column} aria-colindex={columnIndex} rowFocused={rowFocused}>
        {this.props.renderCell(column, data[columnIndex], rowFocused)}
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

  sortByColumn(column) {
    if (column.sortable) {
      this.props.dataSource._sortByColumn(column);
      this.forceUpdate();
    }
  }

  onSelectionChange() {
    // Force update to properly set the state of the Select All checkbox
    this.forceUpdate();

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
    const rowCount = dataSource.getNumberOfRows() + 1;
    let colCount = dataSource.columns.length;
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
          delegate={this}
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
