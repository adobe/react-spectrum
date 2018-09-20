import autobind from 'autobind-decorator';
import Checkbox from '../../Checkbox';
import classNames from 'classnames';
import createId from '../../utils/createId';
import FocusManager from '../../utils/FocusManager';
import focusRing from '../../utils/focusRing';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React from 'react';
import TableCell from './TableCell';

const formatMessage = messageFormatter(intlMessages);

const FOCUSABLE_SELECTOR = '[tabIndex]:not([disabled]):not([aria-disabled])';

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
   * Sets focus to the table row DOM element.
   */
  focus() {
    if (this.row) {
      this.row.focus();
    }
  }

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

  /**
   * Handle key down event on a row, to navigate between focusable descendant
   * elements using the left or right arrow keys, or to navigate between the
   * header row and the body using the down or up arrow keys.
   * @param {KeyboardEvent} event A keydown event
   */
  onKeyDown(event) {
    const {collectionView, isHeaderRow, onSelectChange} = this.props;
    let {key} = event;
    let focusable = null;

    switch (key) {
      case 'ArrowUp':
      case 'Up':
        if (!isHeaderRow && collectionView) {
          let indexPath = collectionView.indexPathForComponent(this);
          if (indexPath && indexPath.section === 0 && indexPath.index === 0) {
            focusable = collectionView.getDOMNode().previousSibling.querySelector(FOCUSABLE_SELECTOR);
          }
        }
        break;
      case 'ArrowDown':
      case 'Down':
        if (isHeaderRow) {
          focusable = this.row.parentNode.nextSibling.querySelector(FOCUSABLE_SELECTOR);
        }
        break;
      case 'a':
        if ((event.metaKey || event.ctrlKey) && onSelectChange) {
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
    }

    if (focusable) {
      event.preventDefault();
      event.stopPropagation();
      focusable.focus();
    }
  }

  /**
   * Handles focus event on row, setting focused state and refreshing visible items in the collection.
   */
  onFocus() {
    this.setState({focused: true});
  }

  /**
   * Handles blur event on row, setting focused state and refreshing visible items in the collection.
   */
  onBlur() {
    this.setState({focused: false});
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

    delete otherProps.onCellClick;
    delete otherProps.onCellDoubleClick;
    delete otherProps.onResize;
    delete otherProps.reusableView;
    delete otherProps.setSelectAll;

    const checkboxCellClassNames = classNames(
      'spectrum-Table-checkboxCell',
      'react-spectrum-TableView-checkboxCell'
    );

    return (
      <FocusManager itemSelector={FOCUSABLE_SELECTOR} orientation="horizontal" manageTabIndex={false} includeSelf ignorePageUpPageDown>
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
          {...otherProps}>
          {allowsSelection &&
            <TableCell
              id={[id, 0].join('-')}
              isHeaderRow={isHeaderRow}
              className={checkboxCellClassNames}
              aria-colindex="1"
              aria-label={isHeaderRow && allowsMultipleSelection === false ? formatMessage('Select') : null}
              focused={focused}>
              <Checkbox
                className="spectrum-Table-checkbox"
                checked={selected}
                indeterminate={indeterminate}
                onChange={onSelectChange}
                onClick={this.onCheckboxClick}
                onMouseDown={e => e.stopPropagation()}
                tabIndex={isHeaderRow || focused ? 0 : -1}
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
              rowFocused: focused
            }))}
        </div>
      </FocusManager>
    );
  }
}
