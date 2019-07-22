import {EditableCollection, SelectableItem} from "./types";

type SelectionOptions = {
  allowsMultipleSelection?: boolean,
  allowsEmptySelection?: boolean
};

/**
 * This class models the selection behavior for a collection view.
 * It extends IndexPathSet which implements the data structure for
 * storing the set of selected items, and implements the mouse/keyboard
 * interaction behavior.
 * @private
 */
export class Selection {
  readonly data: EditableCollection;
  anchor: string | null;
  current: string | null;
  readonly selectedKeys: Set<string>;
  readonly firstSelectedKey: string | null;
  readonly lastSelectedKey: string | null;
  private options: SelectionOptions;

  /**
   * Creates a new Selection
   * @param data the content of the CollectionView
   * @param options options for the selection
   */
  constructor(data: EditableCollection, options: SelectionOptions = {}) {
    this.data = data;
    this.anchor = null;
    this.current = null;
    this.selectedKeys = new Set();
    this.firstSelectedKey = null;
    this.lastSelectedKey = null;
    for (let key of data.getKeys()) {
      let item = data.getItem(key);
      if (item.isSelected) {
        this.selectedKeys.add(key);

        if (!this.firstSelectedKey) {
          this.firstSelectedKey = key;
        }
        this.lastSelectedKey = key;
      }
    }

    this.options = options;

    if (!this.allowsEmptySelection && this.isEmpty() && this.firstSelectedKey) {
      return this.replaceWith(this.firstSelectedKey);
    }
  }

  get allowsMultipleSelection(): boolean {
    return this.options.allowsMultipleSelection !== false;
  }

  get allowsEmptySelection(): boolean {
    return this.options.allowsEmptySelection !== false;
  }

  isEmpty(): boolean {
    return this.selectedKeys.size === 0;
  }

  size(): number {
    return this.selectedKeys.size;
  }

  contains(key: string): boolean {
    return this.selectedKeys.has(key);
  }

  /**
   * Toggles the given key in the selection
   * @param key the key to toggle
   */
  toggle(key: string): Selection {
    let result = this.copy();
    if (!result.allowsMultipleSelection && !(result.allowsEmptySelection && result.contains(key))) {
      result = result.clear();
    }

    if (!this.allowsEmptySelection && result.size() === 1 && result.contains(key)) {
      return result;
    }

    let isSelected = !result.contains(key);
    let data = result.data.update(key, {isSelected});
    result = new Selection(data, this.options);

    // If we the item is now selected, make it the new anchor, otherwise
    // use the last selected item.
    let last = isSelected ? key : result.lastSelectedKey;
    result.anchor = last;
    result.current = last;
    return result;
  }

  private _updateRange(data: EditableCollection, startKey: string, endKey: string, opts: SelectableItem): EditableCollection {
    let keys = data.getKeys();
    let keyArray = Array.isArray(keys) ? keys : [...keys];
    let startIndex = keyArray.indexOf(startKey);
    let endIndex = keyArray.indexOf(endKey);

    if (startIndex < 0 || endIndex < 0) {
      return data;
    }

    if (endIndex < startIndex) {
      [startIndex, endIndex] = [endIndex, startIndex];
    }

    for (let i = startIndex; i <= endIndex; i++) {
      data = data.update(keyArray[i], opts);
    }

    return data;
  }

  /**
   * Extends the selection to the given index path
   * @param key the key to extend the selection to
   */
  extendTo(key: string): Selection {
    if (!this.allowsMultipleSelection) {
      return this.replaceWith(key);
    }

    let result = this.copy();
    let anchor = result.anchor || key;

    let data = result.data;
    data = this._updateRange(data, anchor, result.current || key, {isSelected: false});
    data = this._updateRange(data, key, anchor, {isSelected: true});

    result = new Selection(data, this.options);
    result.current = key;
    result.anchor = anchor;
    return result;
  }

  private _clearData(): EditableCollection {
    let data = this.data;
    for (let key of this.selectedKeys) {
      data = data.update(key, {isSelected: false});
    }

    return data;
  }

  /**
   * Clears the selection
   */
  clear(): Selection {
    if (!this.allowsEmptySelection) {
      return this;
    }

    let data = this._clearData();
    return new Selection(data, this.options);
  }

  /**
   * Clears the selection and replaces it with the given index path
   * @param key the key to replace the selection with
   */
  replaceWith(key: string): Selection {
    let data = this._clearData();
    data = data.update(key, {isSelected: true});
    let result = new Selection(data, this.options);
    result.anchor = key;
    result.current = key;
    return result;
  }

  /**
   * Selects all elements in the content
   */
  selectAll(): Selection {
    if (!this.allowsMultipleSelection) {
      return this;
    }

    let data = this.data;
    for (let key of this.data.getKeys()) {
      data = data.update(key, {isSelected: true});
    }

    let result = new Selection(data, this.options)
    result.anchor = result.firstSelectedKey;
    result.current = result.lastSelectedKey;
    return result;
  }

  /**
   * Copies the selection
   */
  copy(): Selection {
    return Object.create(
      Selection.prototype,
      Object.getOwnPropertyDescriptors(this)
    );
  }
}
