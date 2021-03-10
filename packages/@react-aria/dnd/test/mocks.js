/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export class DataTransferItem {
  constructor(type, data, kind = 'string') {
    this.kind = kind;
    this.type = type;
    this._data = data;
  }

  getAsString(callback) {
    callback(this._data);
  }
}

export class DataTransferItemList {
  constructor(items = []) {
    this._items = items;
  }

  add(data, type) {
    this._items.push(new DataTransferItem(type, data));
  }

  *[Symbol.iterator]() {
    yield* this._items;
  }
}

export class DataTransfer {
  constructor() {
    this.items = new DataTransferItemList();
    this.dropEffect = 'none';
    this.effectAllowed = 'all';
  }

  setDragImage(dragImage, x, y) {
    this._dragImage = {node: dragImage, x, y};
  }

  get types() {
    return this.items._items.map(item => item.type);
  }

  getData(type) {
    return this.items._items.find(item => item.type === type)?._data;
  }
}

export class DragEvent extends MouseEvent {
  constructor(type, init) {
    super(type, {...init, bubbles: true, cancelable: true, composed: true});
    this.dataTransfer = init.dataTransfer;
  }
}
