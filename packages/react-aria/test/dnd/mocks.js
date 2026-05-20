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
    if (this.kind === 'string') {
      callback(this._data);
    }
  }

  getAsFile() {
    if (this.kind === 'file' && this._data instanceof FileSystemFileEntry) {
      return this._data._file;
    }
  }

  webkitGetAsEntry() {
    if (this.kind === 'file') {
      return this._data;
    }
  }
}

export class FileSystemFileEntry {
  constructor(file) {
    this.isFile = true;
    this.isDirectory = false;
    this.name = file.name;
    this._file = file;
  }

  file(cb) {
    cb(this._file);
  }
}

export class FileSystemDirectoryEntry {
  constructor(name, entries) {
    this.isFile = false;
    this.isDirectory = true;
    this.name = name;
    this._entries = entries;
  }

  createReader() {
    return new FileSystemDirectoryReader(this._entries);
  }
}

class FileSystemDirectoryReader {
  constructor(entries) {
    this._entries = entries;
  }

  readEntries(cb) {
    let entries = this._entries;
    this._entries = [];
    cb(entries);
  }
}

export class DataTransferItemList {
  constructor(items = []) {
    this._items = items;
  }

  add(data, type) {
    if (data instanceof File) {
      this._items.push(new DataTransferItem(data.type, new FileSystemFileEntry(data), 'file'));
    } else if (data instanceof FileSystemDirectoryEntry) {
      // Not supported in the real API but used for mocking...
      this._items.push(new DataTransferItem('', data, 'file'));
    } else {
      this._items.push(new DataTransferItem(type, data));
    }
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
    let types = new Set();
    for (let item of this.items) {
      if (item.kind === 'file') {
        types.add('Files');
      } else {
        types.add(item.type);
      }
    }
    return [...types];
  }

  get files() {
    return this.items._items.filter(item => item.kind === 'file').map(item => item.getAsFile());
  }

  getData(type) {
    return this.items._items.find(item => item.kind === 'string' && item.type === type)?._data;
  }

  clearData(type) {
    if (type) {
      this.items._items = this.items._items.filter(item => item.type !== type);
    } else {
      this.items._items = [];
    }
  }
}

export class DragEvent extends MouseEvent {
  constructor(type, init) {
    super(type, {...init, bubbles: true, cancelable: true, composed: true});
    this.dataTransfer = init.dataTransfer;
  }
}

export class ClipboardEvent extends Event {
  constructor(type, init) {
    super(type, {...init, bubbles: true, cancelable: true, composed: true});
    this.clipboardData = init.clipboardData;
  }
}
