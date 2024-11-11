import {GridCollection} from './GridCollection';
import {GridEditState} from './useGridEditState';
import {GridNode} from '@react-types/grid';
import {Key, LayoutDelegate, Node} from '@react-types/shared';
import {MultipleSelectionState, SelectionManager} from '@react-stately/selection';

interface SelectionManagerOptions {
  allowsCellSelection?: boolean,
  layoutDelegate?: LayoutDelegate
}

/**
 * An interface for reading and updating selection and editing state.
 */
export class GridManager extends SelectionManager {
  private editState: GridEditState;

  constructor(collection: GridCollection<Node<unknown>>, selectionState: MultipleSelectionState, editState: GridEditState, options?: SelectionManagerOptions) {
    super(collection, selectionState, options);
    this.editState = editState;
  }

  protected isCell(node?: GridNode<unknown>) {
    return node?.type === 'cell';
  }

  protected isRow(node?: GridNode<unknown>) {
    return node?.type === 'row' || super.isItem(node);
  }

  /**
   * The cell currently being edited.
   */
  get editKey(): Key | null {
    return this.editState.editKey;
  }

  /**
   * Whether a cell is currently being edited.
   */
  get isEditing(): boolean {
    return this.editKey !== null;
  }

  get isKeyboardNavigationDisabled(): boolean {
    return this.editState.isKeyboardNavigationDisabled;
  }

  canEditItem = (key: Key) => {
    if (this.isDisabled(key)) {
      return false;
    }

    let item = this.collection.getItem(key) as GridNode<unknown>;
    return this.isCell(item) && (item.props?.isEditable || item.column?.props?.isEditable);
  };

  /**
   * Sets the editing key.
   */
  setEditKey = (key: Key | null) => {
    if (key !== null  && !this.canEditItem(key)) {
      return;
    }

    if (key !== null && this.canSelectItem(key)) {
      console.warn('Editing selectable cells may have unexpected behavior.');
    }

    this.editState.setEditKey(key);
  };

  enableKeyboardNavigation = () => {
    this.editState.setKeyboardNavigationDisabled(false);
  };

  disableKeyboardNavigation = () => {
    this.editState.setKeyboardNavigationDisabled(true);
  };

  isReadOnly(key: Key) {
    let item = this.collection.getItem(key) as GridNode<unknown>;
    return this.isCell(item) && (item.props?.isReadOnly || item.column?.props?.isReadOnly);
  }

  isDisabled(key: Key) {
    if (super.isDisabled(key)) {
      return true;
    }

    let item = this.collection.getItem(key) as GridNode<unknown>;
    return this.isCell(item) && super.isDisabled(item.parentKey) || (item.column && super.isDisabled(item.column?.key));
  }
}
