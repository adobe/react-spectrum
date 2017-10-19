import classNames from 'classnames';
import React from 'react';

export default class TableCell extends React.Component {
  getCellStyle(column) {
    let style = {
      width: column.width,
      minWidth: column.minWidth,
      maxWidth: column.maxWidth
    };

    if (column.width) {
      style.flexShrink = 0;
    } else {
      style.flexGrow = 1;
    }

    return style;
  }

  render() {
    let {column, isHeaderRow, sortDir, onClick, className, children} = this.props;
    className = classNames(className, {
      'spectrum-Table-headCell': isHeaderRow,
      'spectrum-Table-cell': !isHeaderRow,
      'is-sortable': isHeaderRow && column && column.sortable,
      'is-sorted-desc': isHeaderRow && sortDir === 1,
      'is-sorted-asc': isHeaderRow && sortDir === -1,
      'spectrum-Table-cell--divider': !isHeaderRow && column && column.divider,
      'spectrum-Table-cell--alignCenter': column && column.align === 'center',
      'spectrum-Table-cell--alignRight': column && column.align === 'right'
    });

    return (
      <div className={className} style={column && this.getCellStyle(column)} onClick={onClick}>{children}</div>
    );
  }
}
