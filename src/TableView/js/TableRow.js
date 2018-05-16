import Checkbox from '../../Checkbox';
import classNames from 'classnames';
import React from 'react';
import TableCell from './TableCell';

export default class TableRow extends React.Component {
  onCellClick(column, isDoubleClick) {
    let rowIndex = null;

    if (this.props.collectionView) {
      let indexPath = this.props.collectionView.indexPathForComponent(this);
      rowIndex = indexPath && indexPath.index;
    }

    if (!isDoubleClick && this.props.onCellClick) {
      this.props.onCellClick(column, rowIndex);
    }

    if (isDoubleClick && this.props.onCellDoubleClick) {
      this.props.onCellDoubleClick(column, rowIndex);
    }
  }

  render() {
    let {
      columns,
      renderCell,
      selected = false,
      isHeaderRow,
      allowsSelection,
      onSelectChange,
    } = this.props;
    let className = classNames('react-spectrum-TableView-row', {
      'spectrum-Table-head': isHeaderRow,
      'spectrum-Table-row': !isHeaderRow,
      'is-selected': selected
    });

    return (
      <div className={className}>
        {allowsSelection &&
          <TableCell isHeaderRow={isHeaderRow} className="spectrum-Table-checkboxCell">
            <Checkbox className="spectrum-Table-checkbox" checked={selected} onChange={onSelectChange} />
          </TableCell>
        }
        {columns.map((column, i) => React.cloneElement(renderCell(column, i), {
          key: i,
          onClick: this.onCellClick.bind(this, column, false),
          onDoubleClick: this.onCellClick.bind(this, column, true)
        }))}
      </div>
    );
  }
}
