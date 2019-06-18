/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import Checkbox from '../../Checkbox';
import classNames from 'classnames';
import closest from 'dom-helpers/query/closest';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager, {FOCUSABLE_ELEMENT_SELECTOR} from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React from 'react';
import TableCell from './TableCell';

const formatMessage = messageFormatter(intlMessages);
const CELL_SELECTOR = '[role="gridcell"],[role="columnheader"],[role="rowheader"]';

@focusRing
@autobind
export default class TableRow extends React.Component {
  state = {
    focused: false
  };

  constructor(props) {
    super(props);
    this.rowId = createId();
  }

  componentWillReceiveProps(nextProps) {
    if ('focused' in nextProps) {
      this.setState({
        focused: nextProps.focused
      });
    }
  }

  /**
   * Sets focus to the table row DOM element or appropriate column.
   */
  focus() {
    if (this.row) {
      const {tableView, isHeaderRow} = this.props;

      // tableView keeps track of the focusedColumnIndex when a cell receive focus
      if (tableView) {
        // if a focusedColumnIndex is defined, try to set focus to the appropriate cell.
        if (tableView.focusedColumnIndex !== null) {
          this.row.children[tableView.focusedColumnIndex].focus();
        }

      }

      // If no child of row receives focus:
      // - focus the first focusable descendant of the header row
      // - or focus the row itself.
      if (this.row.contains && !this.row.contains(document.activeElement)) {
        let focusable = isHeaderRow ? this.row.querySelector(FOCUSABLE_ELEMENT_SELECTOR) : this.row;
        if (focusable) {
          focusable.focus();
        }
      }
    }
  }

  onCellClick(column, isDoubleClick, e) {
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

    if (e && e.target.tabIndex === -1) {
      this.focus();
    }
  }

  /**
   * Handle click event on checkbox to toggle selection of row using keyboard.
   * @param {MouseEvent} e Click event
   */
  onCheckboxClick(e) {
    // force selection of item in the selection view
    const {collectionView, isHeaderRow} = this.props;

    if (collectionView && !isHeaderRow) {
      let indexPath = collectionView.indexPathForComponent(this);

      collectionView.selectItem(indexPath, true, e.shiftKey, true);
    }
  }

  onMouseDown(event) {
    // Stop propagation on mouse down if the target is a focusable child of a cell within the row.
    // Otherwise, collection-view will try to focus the row instead.
    if (event.target.matches(FOCUSABLE_ELEMENT_SELECTOR) &&
        event.target !== this.row &&
        !event.target.matches(CELL_SELECTOR)) {
      event.stopPropagation();
    }
  }

  /**
   * Handle key down event on a row, to navigate between focusable descendant
   * elements using the left or right arrow keys, or to navigate between the
   * header row and the body using the down or up arrow keys.
   * @param {KeyboardEvent} event A keydown event
   */
  onKeyDown(event) {
    const {
      tableView,
      collectionView = (tableView ? tableView.collection : null),
      isHeaderRow,
      onSelectChange,
      onCellFocus
    } = this.props;
    let {key} = event;
    let focusable = null;

    switch (key) {
      case 'Tab':
        if (onCellFocus) {
          onCellFocus(null);
        }
        break;
      case 'ArrowUp':
      case 'Up':
        if (!isHeaderRow && collectionView) {
          let indexPath = collectionView.indexPathForComponent(this);
          if (indexPath && indexPath.section === 0 && indexPath.index === 0) {
            if (tableView && tableView.headerRowRef) {
              // try to focus appropriate focusedColumnIndex in the header row
              tableView.headerRowRef.focus();
            }
          }
        }
        break;
      case 'ArrowDown':
      case 'Down':
        if (isHeaderRow) {
          if (onCellFocus && closest(event.target, '.spectrum-Table-checkboxCell')) {
            onCellFocus(null);
          }
          if (collectionView) {
            focusable = collectionView.getDOMNode().querySelector(FOCUSABLE_ELEMENT_SELECTOR);
          }
        } else if (collectionView) {
          let indexPath = collectionView.indexPathForComponent(this);
          if (indexPath && indexPath.section === 0 && indexPath.index === collectionView.getSectionLength(0) - 1) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
        break;
      case 'a':
        if (isHeaderRow && (event.metaKey || event.ctrlKey) && onSelectChange) {
          onSelectChange(true);
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'Escape':
      case 'Esc':
        if (onSelectChange) {
          onSelectChange(false);
        }
        break;
      case 'Enter':
      case ' ':
        // Stop propagation on enter and space keys if the target is a focusable child of a cell within the row.
        // Otherwise, collection-view will try to focus the row instead.
        if (event.target.matches(FOCUSABLE_ELEMENT_SELECTOR) &&
            event.target !== this.row &&
            !event.target.matches(CELL_SELECTOR)) {
          event.stopPropagation();
        }
        break;
    }

    if (focusable) {
      event.preventDefault();
      event.stopPropagation();
      focusable.focus();
    }
  }

  /**
   * Handles focus event on row, setting focused state and refreshing visible items in the collection.
   * @param {FocusEvent} event A focus event
   */
  onFocus(e) {
    this.setState({focused: true});

    if (e && e.target === this.row) {
      if (!this.row.contains(e.relatedTarget)) {
        // If row itself is receiving focus, call focus method to see if focus is being marshalled to a focused column
        this.focus();
        if (this.props.onFocus) {
          this.props.onFocus(e);
        }
      } else if (this.props.onCellFocus) {
        this.props.onCellFocus(null);
      }
    }
  }

  /**
   * Handles blur event on row, setting focused state and refreshing visible items in the collection.
   */
  onBlur() {
    this.setState({focused: false});
  }

  /**
   * Handles focus event on cell
   * @param {Number} columnIndex Index of column receiving keyboard focus
   */
  onCellFocus(columnIndex, e) {
    if (this.props.onCellFocus) {
      this.props.onCellFocus(columnIndex, e);
    }
  }

  getAriaLabelledby() {
    let {
      columns,
      isHeaderRow,
      allowsSelection,
      id = this.rowId,
      tableId
    } = this.props;
    let ariaLabelledby = null;

    if (isHeaderRow && tableId) {
      id = [tableId, 0].join('-');
    }

    ariaLabelledby = columns.map((column, i) => {
      if (allowsSelection) {
        i += 1;
      }
      if (column.announce !== false) {
        return [[tableId, 0, i].join('-'), [id, i].join('-')].join(' ');
      }
    }).join(' ');

    return !isHeaderRow ? ariaLabelledby : null;
  }

  render() {
    let {
      columns,
      renderCell,
      selected = false,
      focused = false,
      isHeaderRow,
      allowsSelection,
      onSelectChange,
      id = this.rowId,
      tableId,
      layoutInfo = {},
      collectionView,
      allowsMultipleSelection,
      ...otherProps
    } = this.props;
    let {
      index
    } = layoutInfo;
    let className = classNames('react-spectrum-TableView-row', {
      'spectrum-Table-head': isHeaderRow,
      'spectrum-Table-row': !isHeaderRow,
      'is-selected': selected,
      'is-focused': focused && this.state.focused,
      'is-drop-target': this.props['drop-target']
    });
    let ariaRowIndex = null;
    let tabIndex = null;
    let indeterminate = null;

    if (isHeaderRow && tableId) {
      id = [tableId, 0].join('-');
    }

    if (collectionView) {
      if (!isHeaderRow) {
        ariaRowIndex = index;
        if (ariaRowIndex !== null) {
          ariaRowIndex += 2;
        }

        // determine appropriate tabIndex for row depending on whether it is focused.
        tabIndex = focused || !collectionView.focusedIndexPath ? 0 : -1;
      } else {
        indeterminate = !selected && collectionView.selectedIndexPaths.length > 0;
      }
    }

    delete otherProps.onFocus;

    const checkboxCellClassNames = classNames(
      'spectrum-Table-checkboxCell',
      'react-spectrum-TableView-checkboxCell'
    );

    return (
      <FocusManager itemSelector={FOCUSABLE_ELEMENT_SELECTOR} orientation="horizontal" manageTabIndex={false} includeSelf ignorePageUpPageDown>
        <div
          className={className}
          ref={row => this.row = row}
          id={id}
          role="row"
          tabIndex={tabIndex}
          aria-selected={allowsSelection ? selected : null}
          aria-rowindex={isHeaderRow ? 1 : ariaRowIndex}
          aria-labelledby={this.getAriaLabelledby()}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          onMouseDown={this.onMouseDown}
          {...filterDOMProps(otherProps)}>
          {allowsSelection &&
            <TableCell
              id={[id, 0].join('-')}
              isHeaderRow={isHeaderRow}
              className={checkboxCellClassNames}
              aria-colindex="1"
              aria-label={isHeaderRow && allowsMultipleSelection === false ? formatMessage('Select') : null}
              tabIndex={isHeaderRow ? null : -1}
              onFocus={this.onCellFocus.bind(this, 0)}
              focused={focused}>
              <Checkbox
                className="spectrum-Table-checkbox"
                checked={selected}
                indeterminate={indeterminate}
                onChange={onSelectChange}
                onClick={this.onCheckboxClick}
                onMouseDown={e => e.stopPropagation()}
                id={[id, 0, 'checkbox'].join('-')}
                tabIndex={isHeaderRow || focused ? 0 : -1}
                aria-label={isHeaderRow ? formatMessage('Select All') : formatMessage('Select')}
                aria-labelledby={!isHeaderRow ? [id, 0, 'checkbox'].join('-') + ' ' + this.getAriaLabelledby() : null}
                title={isHeaderRow ? formatMessage('Select All') : formatMessage('Select')}
                style={(isHeaderRow && !allowsMultipleSelection) ? {visibility: 'hidden'} : null} />
            </TableCell>
          }
          {columns.map((column, i) => React.cloneElement(
            renderCell(column, i, focused),
            {
              key: i,
              id: [id, (allowsSelection ? (i + 1) : i)].join('-'),
              'aria-colindex': (allowsSelection ? (i + 2) : (i + 1)),
              onClick: this.onCellClick.bind(this, column, false),
              onDoubleClick: this.onCellClick.bind(this, column, true),
              onFocus: this.onCellFocus.bind(this, (allowsSelection ? (i + 1) : i)),
              rowFocused: focused
            }))}
        </div>
      </FocusManager>
    );
  }
}
