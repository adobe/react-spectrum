import ArrowDownSmall from '../../Icon/core/ArrowDownSmall';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {FOCUSABLE_ELEMENT_SELECTOR} from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import React from 'react';
import ReactDOM from 'react-dom';

@focusRing
@autobind
export default class TableCell extends React.Component {
  state = {
    focused: false,
    childFocused: false
  };

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
      style.flexBasis = 0;
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

  onFocus(e) {
    const cellNode = ReactDOM.findDOMNode(this);
    const childFocused = cellNode !== e.target;
    this.setState({childFocused});

    if (!childFocused) {
      // If a child can receive focus, marshall focus to the focusable descendant
      const focusable = cellNode.querySelector(FOCUSABLE_ELEMENT_SELECTOR);
      if (focusable && focusable !== e.relatedTarget) {
        e.stopPropagation();
        e.preventDefault();
        // prevent extra focus events from propagating focusing child
        e.nativeEvent.stopImmediatePropagation();
        focusable.focus();
        return;
      }
    }

    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  onBlur(e) {
    const cellNode = ReactDOM.findDOMNode(this);
    if (cellNode !== e.target && !cellNode.contains(document.activeElement)) {
      this.setState({childFocused: false});
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
      tabIndex,
      rowFocused
    } = this.props;
    let isSortable = isHeaderRow && column && column.sortable;
    className = classNames(className, {
      'spectrum-Table-headCell': isHeaderRow,
      'spectrum-Table-cell': !isHeaderRow,
      'react-spectrum-Table-cell': !isHeaderRow,
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
    } else if (tabIndex !== null) {
      tabIndex = this.state.childFocused ? null : -1;
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={className}
        style={column && this.getCellStyle(column)}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyPress={isSortable ? this.onKeyPress : null}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
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
