import {CollectionView, CollectionViewOptions} from './CollectionView';
import {DropPosition, DragTarget} from './DragTarget';
import {DropOperation} from './DropOperation';
import {Point} from './Point';
import {Selection} from './Selection';
import {DragDelegate, DropDelegate} from '@react-types/shared';
import {EditableCollection} from './types';
import { LayoutInfo } from './LayoutInfo';
import { ReusableView } from './ReusableView';

interface EditableCollectionViewOptions extends CollectionViewOptions {
  data?: EditableCollection,
  allowsSelection?: boolean,
  allowsMultipleSelection?: boolean,
  allowsEmptySelection?: boolean,
  selectionMode?: 'replace' | 'toggle',
  keyboardMode?: 'selection' | 'focus',
  selectOnMouseUp?: boolean,
  dragDelegate?: DragDelegate,
  dropDelegate?: DropDelegate
}

const SCROLLTOITEM_DURATION = 200;
const SELECTION_MAP = new WeakMap<EditableCollection, Selection>();

/**
 * The EditableCollectionView class extends {@link CollectionView} with support for multiple selection,
 * keyboard interaction, drag and drop, and content reordering. It interacts with your {@link DataSource}
 * to allow users to drop new items and sections into the collection view to be inserted, drag and drop
 * views in the collection view to allow reordering of items or sections, and supports deletions of the
 * selected items via keyboard interaction. It also extends the collection view's delegate with additional
 * methods in {@link EditableCollectionViewDelegate} to allow overriding some of this behavior. Additionally,
 * the {@link Layout} is involved very closely in determining the behavior of views during drag and drop,
 * and keyboard selection behavior.
 */
export class EditableCollectionView extends CollectionView {
  /** Whether the user can select items. Default is `true`. */
  allowsSelection: boolean;

  /** Whether the user can select multiple items at once. Default is `true`. */
  allowsMultipleSelection: boolean;

  /** Whether the user can select no items. Default is `true`. */
  allowsEmptySelection: boolean;

  /** The default selection mode: either 'replace' or 'toggle'. Default is 'replace'. */
  selectionMode: 'replace' | 'toggle';

  /**
   * The keyboard interaction mode: either 'selection' or 'focus'. Controls arrow key behavior.
   * Default is 'selection' if allowsSelection is enabled, otherwise 'focus'.
   */
  keyboardMode: 'selection' | 'focus';

  /**
   * Whether to emit selection changes on mouse up. Default is `false`,
   * meaning emit on mouse down.
   */
  selectOnMouseUp: boolean;

  dragDelegate?: DragDelegate;
  dropDelegate?: DropDelegate;
  protected _data: EditableCollection;
  private _selection: Selection;
  private _focusedKey: string | null;
  private _mouseOffset: Point | null;
  private _dragTarget: DragTarget | null;
  private _dropTarget: DragTarget | null;
  private _selectOnMouseUp: string | null;
  private _focusItemRaf: number | null;
  private _scrollSpeedX: number = 0;
  private _scrollSpeedY: number = 0;
  private _scrollTimer: number | null;

  constructor(options: EditableCollectionViewOptions = {}) {
    super(options);

    this.allowsSelection = options.allowsSelection !== false;
    this.allowsMultipleSelection = options.allowsMultipleSelection !== false;
    this.allowsEmptySelection = options.allowsEmptySelection !== false;
    this.selectionMode = options.selectionMode || 'replace';
    this.keyboardMode = options.keyboardMode || (this.allowsSelection ? 'selection' : 'focus');
    this.selectOnMouseUp = options.selectOnMouseUp || false;
    this.dragDelegate = options.dragDelegate;
    this.dropDelegate = options.dropDelegate;

    this._focusedKey = null;
    this._mouseOffset = null;
    this._dragTarget = null;
    this._dropTarget = null;
    this._selectOnMouseUp = null;

    // Make keyboard focusable
    this.setAttribute('tabIndex', -1);

    // Bind events
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this._setupEvents();
    
    if (options.data) {
      this._setData(options.data);
    }
  }

  protected updateAccessibilityAttributes(props) {
    const {allowsMultipleSelection = true} = props;
    if (props['aria-multiselectable']) {
      if (!this.attrs['aria-multiselectable'] ||
         this.attrs['aria-multiselectable'] !== allowsMultipleSelection) {
        this.setAttribute('aria-multiselectable', allowsMultipleSelection);
      }
    }
    // super.updateAccessibilityAttributes(props);
  }

  private _setupEvents() {
    this.onEvent('mouseDown', this.mouseDown);
    this.onEvent('mouseUp', this.mouseUp);
    this.onEvent('keyDown', this.keyDown);
    this.onEvent('focus', this.onFocus);
    this.onEvent('blur', this.onBlur);
    this.backend.registerDragEvents(this);
  }

  private _teardownEvents() {
    this.offEvent('mouseDown', this.mouseDown);
    this.offEvent('mouseUp', this.mouseUp);
    this.offEvent('keyDown', this.keyDown);
    this.offEvent('focus', this.onFocus);
    this.offEvent('blur', this.onBlur);
    this.backend.unregisterDragEvents(this);
  }

  get data(): EditableCollection {
    return this._data;
  }

  set data(data: EditableCollection) {
    this._setData(data);
  }

  protected _setData(data: EditableCollection) {
    let existingSelection = SELECTION_MAP.get(data);
    if (existingSelection) {
      this._selection = existingSelection;
    } else {
      let oldSelection = this._selection;

      this._selection = new Selection(data, {
        allowsMultipleSelection: this.allowsMultipleSelection,
        allowsEmptySelection: this.allowsEmptySelection
      });

      // Retain the anchor/current from the previous selection if possible
      // TODO: is this right? what if the user modifies a selection we send to onChange before sending it back in?
      // might need to store `nextAnchor` and `nextCurrent` somewhere...
      if (oldSelection) {
        if (oldSelection.anchor && data.getItem(oldSelection.anchor)) {
          this._selection.anchor = oldSelection.anchor;
        }

        if (oldSelection.current && data.getItem(oldSelection.current)) {
          this._selection.current = oldSelection.current;
        }
      }

      SELECTION_MAP.set(this._selection.data, this._selection);

      // Creating a selection can cause selection changes, for example
      // if an empty selection is not allowed.
      if (this._selection.data !== data) {
        this.emit('change', this._selection.data);
        // TODO: return??
      }
    }

    if (this._focusedKey && !data.getItem(this._focusedKey)) {
      this._focusedKey = null;
      // TODO: Where should focus go?
    }

    super._setData(data);
  }

  getReusableView(layoutInfo: LayoutInfo): ReusableView {
    let view = super.getReusableView(layoutInfo);
    if (layoutInfo.type !== 'item') {
      return view;
    }

    this._updateViewState(view);
    return view;
  }

  // MARK: selection support

  mouseDown(e: MouseEvent) {
    let point = this.convertPoint(new Point(e.clientX, e.clientY));
    let key = this.keyAtPoint(point);
    if (!key) {
      if (!e.metaKey && !e.shiftKey) {
        this.clearSelection();
      }

      // Emit an event when the user clicks on the background (e.g. not on an item view)
      this.emit('backgroundClick', point);
      return;
    }

    let layoutInfo = this.layout.getLayoutInfo('item', key);
    this._mouseOffset = new Point(point.x - layoutInfo.rect.x, point.y - layoutInfo.rect.y);

    this.focusItem(key);

    // If clicking on an already selected index without any modifier keys, replace the selection
    // with that index on mouse up.
    if (!e.metaKey && !e.shiftKey && this._selection.contains(key) || this.selectOnMouseUp) {
      this._selectOnMouseUp = key;
    } else {
      this.selectItem(key, e.metaKey || this.selectionMode === 'toggle', e.shiftKey);
    }
  }

  mouseUp(e: MouseEvent) {
    if (this._selectOnMouseUp != null) {
      this.selectItem(this._selectOnMouseUp, this.selectionMode === 'toggle', e.shiftKey);
      this._selectOnMouseUp = null;
    }
  }

  /**
   * Selects the item with the given key. By default it replaces the current
   * selection, unless the `toggle` or `extend` options are true.
   * @param key The key of the item to select
   * @param toggle Whether to toggle the key.
   *    Adds it to the selection if not already in it, or removes it if it is.
   * @param extend - Whether to extend the selection to the given key.
   *    If true, the all items between the current selection anchor and the given key
   *    are selected
   */
  selectItem(key: string, toggle: boolean = false, extend: boolean = false) {
    if (!key || !this.allowsSelection) {
      return;
    }

    // if (this.delegate.shouldSelectItem && !this.delegate.shouldSelectItem(key)) {
    //   return;
    // }

    let selection;
    if (extend) {
      selection = this._selection.extendTo(key);
    } else if (toggle) {
      selection = this._selection.toggle(key);
    } else {
      selection = this._selection.replaceWith(key);
    }

    this._updateSelection(selection);
  }

  /**
   * Clears the selection
   */
  clearSelection() {
    let selection = this._selection.clear();
    this._updateSelection(selection);
  }

  /**
   * Selects all items in the collection view
   */
  selectAll() {
    if (!this.allowsSelection) {
      return;
    }

    let selection = this._selection.selectAll();
    this._updateSelection(selection);
  }

  private _updateSelection(selection: Selection) {
    if (!this.allowsSelection) {
      return;
    }

    SELECTION_MAP.set(selection.data, selection);
    this.emit('change', selection.data);
  }

  private _updateVisibleViewStates() {
    for (let view of this._visibleViews.values()) {
      this._updateViewState(view);
    }
  }

  private _updateViewState(view: ReusableView) {
    let layoutInfo = view.layoutInfo;
    if (!layoutInfo || layoutInfo.type !== 'item') {
      return;
    }

    let key = layoutInfo.key;

    view.setState('selected', this._selection.contains(key));
    view.setState('focused', this._focusedKey ? this._focusedKey === key : false);
  }

  /**
   * Focus the item with the given key.
   * @param key The key to of item to focus
   */
  focusItem(key: string) {
    if (!key || (key === this._focusedKey && !this.getItemView(key))) {
      return;
    }

    this._focusedKey = key;

    if (this._scrollAnimation) {
      if (this._focusItemRaf) {
        cancelAnimationFrame(this._focusItemRaf);
      }
      this._focusItemRaf = requestAnimationFrame(() => this._focusItemNow(key));
    } else {
      this._focusItemNow(key);
    }
  }

  private _focusItemNow(key: string) {
    if (!key) {
      return;
    }

    let view = this.getItemView(key);

    this._focusItemRaf = null;
    let _focusItemView = () => {
      view = this.getItemView(key);
      if (!view) {
        return;
      }

      this.setAttribute('tabIndex', -1);
      requestAnimationFrame(() => view && view.focus());
    };

    // If scrolling, and view is not yet present in the viewport,
    if (this._scrollAnimation && !view) {
      // focus the EditableCollectionView until animation completes,
      this.focus();
      // then restore focus to the appropriate item.
      this._scrollAnimation.then(_focusItemView);
    } else {
      // Otherwise, focus the appropriate item.
      _focusItemView();
    }

    // update focused state and tabIndex for visible views
    this._updateVisibleViewStates();
  }

  // MARK: drag and drop support

  private dragStart(event: DragEvent) {
    let point = this.convertPoint(new Point(event.clientX, event.clientY));
    let target = this.layout.getDragTarget(point);
    if (!target) {
      return DropOperation.NONE;
    }

    if (!this.dragDelegate) {
      return DropOperation.NONE;
    }

    if (this.dragDelegate.shouldAllowDrag && !this.dragDelegate.shouldAllowDrag(target)) {
      return DropOperation.NONE;
    }

    let dragView = this._getDragView(target, this._selection.selectedKeys);
    if (dragView) {
      dragView.renderBackendView(this.backend);
      this.backend.setDragImage(event, dragView);
    }

    // Ask the delegate for drag data
    this.dragDelegate.prepareDragData(target, event.dataTransfer);

    this._selectOnMouseUp = null;
    this._dragTarget = target;

    // Default to allowing all drop operations for this drag, but allow the delegate to override.
    let allowedOperations = DropOperation.ALL;
    if (this.dragDelegate.getAllowedDropOperations) {
      allowedOperations = this.dragDelegate.getAllowedDropOperations(target);
    }

    return allowedOperations;
  }

  private _getDragView(target: DragTarget, selectedKeys: Set<string>) {
    let dragView = this._getDragViewFromDelegate(target, selectedKeys);
    if (dragView) {
      return dragView;
    }

    let view = this.getItemView(target.key);
    if (!view) {
      return null;
    }

    return view;
  }

  private _getDragViewFromDelegate(target: DragTarget, keys: Set<string>): ReusableView | null {
    if (this.dragDelegate && this.dragDelegate.getDragView) {
      return this.dragDelegate.getDragView(target, keys);
    }

    return null;
  }

  private _shouldAcceptDrop(event: DragEvent) {
    if (this.dropDelegate) {
      // Ask the delegate if it has a shouldAcceptDrop method.
      if (this.dropDelegate.shouldAcceptDrop && !this.dropDelegate.shouldAcceptDrop(event)) {
        return false;
      }

      return true;
    }

    return false;
  }

  private dragEntered(event: DragEvent, allowedOperations: DropOperation): DropOperation {
    if (this._shouldAcceptDrop(event)) {
      this._enableTransitions();
      return DropOperation.MOVE;
    }

    return DropOperation.NONE;
  }

  private _getDropTargetView(dropTarget) {
    if (dropTarget && dropTarget.dropPosition === DropPosition.ON) {
      return this.getView(dropTarget.type, dropTarget.key);
    }

    return null;
  }

  private _setDropTarget(dropTarget) {
    if (this._dropTarget && dropTarget && this._dropTarget.equals(dropTarget)) {
      return false;
    }

    let dropTargetView = this._getDropTargetView(this._dropTarget);
    if (dropTargetView) {
      dropTargetView.removeState('drop-target');
    }

    dropTargetView = this._getDropTargetView(dropTarget);
    if (dropTargetView) {
      dropTargetView.addState('drop-target');
    }

    this._dropTarget = dropTarget;

    if (this.dropDelegate && typeof this.dropDelegate.onDropTargetChange === 'function') {
      this.dropDelegate.onDropTargetChange(dropTarget);
    }

    return true;
  }

  private dragMoved(event: DragEvent, allowedOperations: DropOperation) {
    let point = this.convertPoint(new Point(event.clientX, event.clientY));
    let target = this.layout.getDropTarget(point);

    // Call the delegate to override the target from the layout
    if (target && this.dropDelegate && this.dropDelegate.overrideDropTarget) {
      target = this.dropDelegate.overrideDropTarget(target);
    }

    let dropOperation = DropOperation.NONE;
    if (target) {
      // Ask the delegate to get the drop operation,
      // or default to the first allowed operation.
      if (this.dropDelegate && this.dropDelegate.getDropOperation) {
        dropOperation = this.dropDelegate.getDropOperation(target, allowedOperations);
      } else {
        // Get the least significant bit that is set
        dropOperation = allowedOperations & -allowedOperations;
      }
    }

    if (this._setDropTarget(target)) {
      this.relayoutNow();
    }

    let scrollBottom = this.size.height - 60;
    let scrollTop = 60;
    let scrollLeft = 60;
    let scrollRight = this.size.width - 60;
    let x = point.x - this._contentOffset.x;
    let y = point.y - this._contentOffset.y;
    if (x < scrollLeft || x > scrollRight || y < scrollTop || y > scrollBottom) {
      let scrollSpeedX = 0;
      let scrollSpeedY = 0;
      if (x < scrollLeft) {
        scrollSpeedX = x - scrollLeft;
      } else if (x > scrollRight) {
        scrollSpeedX = x - scrollRight;
      }
      if (y < scrollTop) {
        scrollSpeedY = y - scrollTop;
      } else if (y > scrollBottom) {
        scrollSpeedY = y - scrollBottom;
      }
      this._scroll(event, scrollSpeedX, scrollSpeedY);
    } else {
      this._stopScrolling();
    }

    return dropOperation;
  }

  private _scroll(event: DragEvent, scrollSpeedX: number, scrollSpeedY: number) {
    this._scrollSpeedX = scrollSpeedX * 0.33;
    this._scrollSpeedY = scrollSpeedY * 0.33;

    let frame = () => {
      this.setContentOffset(new Point(this._contentOffset.x + this._scrollSpeedX, this._contentOffset.y + this._scrollSpeedY));
      if (this._scrollTimer) {
        this._scrollTimer = requestAnimationFrame(frame);
      }
    };

    this._scrollTimer = this._scrollTimer || requestAnimationFrame(frame);
  }

  private _stopScrolling() {
    if (this._scrollTimer) {
      cancelAnimationFrame(this._scrollTimer);
      this._scrollTimer = null;
    }
  }

  private dragExited() {
    this._setDropTarget(null);
    this.relayoutNow();

    this._stopScrolling();

    if (!this._dragTarget) {
      setTimeout(() => {
        if (!this._dragTarget) {
          this._disableTransitions();
        }
      }, this.transitionDuration);
    }
  }

  private dragEnd(event: DragEvent, dropOperation: DropOperation) {
    this.dragExited();

    let target = this._dragTarget;
    this._dragTarget = null;
    this._setDropTarget(null);

    if (!this._transaction) {
      this._disableTransitions();
    }

    if (dropOperation && this.dragDelegate && this.dragDelegate.onDragEnd) {
      this.dragDelegate.onDragEnd(target, dropOperation);
    }
  }

  private drop(event: DragEvent, dropOperation: DropOperation) {
    let dropTarget = this._dropTarget;
    if (!dropTarget) {
      return;
    }

    this._setDropTarget(null);

    requestAnimationFrame(() => {
      this.dropDelegate.onDrop(dropTarget, event.dataTransfer, dropOperation);
    });
  }

  // MARK: copy and paste support

  private cut(event: ClipboardEvent) {
    // 1. write selected items to clipboard
    // 2. delete selected items
  }
  
  private copy(event: ClipboardEvent) {
    // write selected items to clipboard
  }

  private paste(event: ClipboardEvent) {
    // 1. read from clipboard
    // 2. ??? where to put the items? replace selected items? what if nothing is selected? insert at start/end?
  }

  // MARK: keyboard support

  private keyDown(event: KeyboardEvent) {
    this.emit('keyDown', event);
    if (event.defaultPrevented) {
      return;
    }

    switch (event.keyCode) {
      case 13: // enter
      case 32: // space
        if (this._focusedKey) {
          event.preventDefault();
          this.selectItem(this._focusedKey, event.metaKey || this.selectionMode === 'toggle', event.shiftKey);
        }
        break;
      case 37: // left
        event.preventDefault();
        if (event.shiftKey) {
          return this.selectLeft();
        }

        return this.moveLeft();

      case 38: // up
        event.preventDefault();
        if (event.shiftKey) {
          return this.selectUp();
        }

        return this.moveUp();

      case 39: // right
        event.preventDefault();
        if (event.shiftKey) {
          return this.selectRight();
        }

        return this.moveRight();

      case 40: // down
        event.preventDefault();
        if (event.shiftKey) {
          return this.selectDown();
        }

        return this.moveDown();

      case 27: // escape
        event.preventDefault();
        return this.clearSelection();

      case 65: // A
        if (event.metaKey) { // TODO: windows
          event.preventDefault();
          this.selectAll();
        }

        return;

      case 46: // delete
      case 8: // backspace
        // if (this.canDeleteItems) {
          // TODO
          event.preventDefault();
        // }
        return this.delete();
    }
  }

  private onFocus(event: FocusEvent) {
    this.emit('focus', event);
    if (!this.backendView) {
      return;
    }

    const node = this.getDOMNode();
    if (node === event.target) {
      return;
    }

    // prevent scrollview from scrolling on focus
    if (typeof node === 'object' && 'scrollTop' in node) {
      node.scrollTop = 0;
    }

    let focusedKey;
    let restoringFocus = node === event.relatedTarget;

    if (restoringFocus) {
      focusedKey = this._focusedKey;
    } else {
      focusedKey = this.keyAtDOMNode(event.target as HTMLElement);
    }

    if (focusedKey) {
      this._focusedKey = focusedKey;

      // Select if keyboardMode is selection, selectionMode is toggle, and selection has not already happened.
      if (this.keyboardMode === 'selection' &&
          this.selectionMode === 'toggle' &&
          this._selection.isEmpty()) {
        this.selectItem(focusedKey, false, false);
      }

      if (!restoringFocus) {
        this.scrollToItem(focusedKey, SCROLLTOITEM_DURATION);
      }

      // update focused state and tabIndex for visible views
      this._updateVisibleViewStates();
    }
  }

  private onBlur(event: FocusEvent) {
    this.emit('blur', event);
  }

  scroll(e) {
    super.scroll(e);
    const key = this._focusedKey;

    if (key) {
      const view = this.getItemView(key);
      // if the focused item has scrolled out of view and no longer exists in DOM
      if (!view && this.attrs.tabIndex !== 0) {
        this.setAttribute('tabIndex', 0);
        // set focus to the collection view and make sure that it can still receive focus with the tab key
        this.focus();
      } else if (view && this.attrs.tabIndex !== -1) {
        // otherwise the collection view itself should not receive focus with the tab key,
        this.setAttribute('tabIndex', -1);
        // focus should be restored to the focused item
        requestAnimationFrame(() => this.focusItem(key));
      }
    }
  }

  private _moveSelection(method: string, key: string | null, extend = false) {
    let select = true;

    // If keyboardMode is focus, move the focused item instead of changing the selection.
    if (this._focusedKey) {
      key = this._focusedKey;
    }

    if (this.keyboardMode === 'focus') {
      select = extend;
    }

    if (!key) {
      return;
    }

    key = this.layout[method](key);
    if (!key) {
      return;
    }

    if (select) {
      this.selectItem(key, false, extend);
    }

    this.scrollToItem(key, SCROLLTOITEM_DURATION);
    this.focusItem(key);
  }

  /**
   * Selects the item above the currently selected one, replacing the existing selection.
   */
  moveUp() {
    this._moveSelection('getKeyAbove', this._selection.firstSelectedKey);
  }

  /**
   * Selects the item below the currently selected one, replacing the existing selection.
   */
  moveDown() {
    this._moveSelection('getKeyBelow', this._selection.lastSelectedKey);
  }

  /**
   * Selects the item to the left of the currently selected one, replacing the existing selection.
   */
  moveLeft() {
    this._moveSelection('getKeyLeftOf', this._selection.firstSelectedKey);
  }

  /**
   * Selects the item to the right of the currently selected one, replacing the existing selection.
   */
  moveRight() {
    this._moveSelection('getKeyRightOf', this._selection.lastSelectedKey);
  }

  /**
   * Selects the item above the currently selected one, extending the existing selection.
   */
  selectUp() {
    this._moveSelection('getKeyAbove', this._selection.current, true);
  }

  /**
   * Selects the item below the currently selected one, extending the existing selection.
   */
  selectDown() {
    this._moveSelection('getKeyBelow', this._selection.current, true);
  }

  /**
   * Selects the item to the left of the currently selected one, extending the existing selection.
   */
  selectLeft() {
    this._moveSelection('getKeyLeftOf', this._selection.current, true);
  }

  /**
   * Selects the item to the right of the currently selected one, extending the existing selection.
   */
  selectRight() {
    this._moveSelection('getKeyRightOf', this._selection.current, true);
  }

  /**
   * Triggers a deletion of the currently selected items via the data source
   */
  delete() {
    let selectedKeys = this._selection.selectedKeys;

    // This does not emit onChange because you typically want to update a server or some
    // other external data source, rather than just call setState. It is a data change, not
    // only a state change.
    this.emit('delete', selectedKeys);
  }
}
