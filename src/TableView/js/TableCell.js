import ArrowDownSmall from '../../Icon/core/ArrowDownSmall';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import focusRing from '../../utils/focusRing';
import React from 'react';

@focusRing
@autobind
export default class TableCell extends React.Component {
  constructor(props) {
    super(props);
    this.cellId = createId();
  }
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

  onKeyPress(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (this.props.onClick) {
        e.preventDefault();
        this.props.onClick(e);
      }
    }
  }

  render() {
    let {
      column,
      id = this.cellId,
      isHeaderRow,
      sortDir,
      onClick,
      onDoubleClick,
      className,
      children,
      allowsMultipleSelection,
      tabIndex = null,
      rowFocused
    } = this.props;
    let isSortable = isHeaderRow && column && column.sortable;
    className = classNames(className, {
      'spectrum-Table-headCell': isHeaderRow,
      'spectrum-Table-cell': !isHeaderRow,
      'is-sortable': isSortable,
      'is-sorted-desc': isHeaderRow && sortDir === 1,
      'is-sorted-asc': isHeaderRow && sortDir === -1,
      'spectrum-Table-cell--divider': !isHeaderRow && column && column.divider,
      'spectrum-Table-cell--alignCenter': column && column.align === 'center',
      'spectrum-Table-cell--alignRight': column && column.align === 'right'
    });

    let ariaSort = null;
    if (isSortable) {
      switch (sortDir) {
        case 1:
          ariaSort = 'descending';
          break;
        case -1:
          ariaSort = 'ascending';
          break;
        default:
          ariaSort = 'none';
      }
    }

    if (isSortable) {
      tabIndex = rowFocused || !allowsMultipleSelection ? 0 : -1;
    }

    return (
      <div
        className={className}
        style={column && this.getCellStyle(column)}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyPress={isSortable ? this.onKeyPress : null}
        id={id}
        role={isHeaderRow ? 'columnheader' : 'gridcell'}
        aria-sort={ariaSort}
        aria-label={this.props['aria-label']}
        aria-colindex={this.props['aria-colindex']}
        tabIndex={tabIndex}>
        {children}
        {isSortable &&
          <ArrowDownSmall className="spectrum-Table-sortedIcon" size={null} />
        }
      </div>
    );
  }
}
