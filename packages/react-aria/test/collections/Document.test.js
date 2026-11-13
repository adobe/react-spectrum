/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BaseCollection, CollectionNode} from '../../src/collections/BaseCollection';
import {Document} from '../../src/collections/Document';

class ItemNode extends CollectionNode {
  static type = 'item';
}

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

function createItem(doc, key) {
  let element = doc.createElementNS(XHTML_NAMESPACE, 'item');
  element.setProps({id: key}, null, ItemNode);
  return element;
}

// Follows the sibling key chain, which is what determines the rendered order.
function getKeys(doc) {
  let collection = doc.getCollection();
  let keys = [];
  for (let key = collection.getFirstKey(); key != null; key = collection.getItem(key).nextKey) {
    keys.push(key);
  }
  return keys;
}

// Mirrors how Preact's diff places a child: insert it before the cursor, then move the cursor to
// the next sibling, skipping comment nodes.
function preactInsert(parent, node, cursor) {
  parent.insertBefore(node, cursor);
  return nextPreactCursor(node);
}

function nextPreactCursor(node) {
  let next = node;
  while ((next = next && next.nextSibling) && next.nodeType === 8);
  return next;
}

describe('Document', () => {
  let doc;
  beforeEach(() => {
    doc = new Document(new BaseCollection());
  });

  it('keeps elements created with createElement as comment nodes for React DevTools', () => {
    expect(doc.createElement('item').nodeType).toBe(8);
  });

  it('creates element nodes with createElementNS', () => {
    let element = doc.createElementNS(XHTML_NAMESPACE, 'item');
    expect(element.nodeType).toBe(1);
    expect(element.ownerDocument).toBe(doc);
  });

  it('keeps insertion order when Preact inserts several items before a sibling', () => {
    let a = createItem(doc, 'a');
    let b = createItem(doc, 'b');
    doc.appendChild(a);
    doc.appendChild(b);
    expect(getKeys(doc)).toEqual(['a', 'b']);

    let cursor = nextPreactCursor(a);
    cursor = preactInsert(doc, createItem(doc, 'x'), cursor);
    preactInsert(doc, createItem(doc, 'y'), cursor);

    expect(getKeys(doc)).toEqual(['a', 'x', 'y', 'b']);
  });

  it('removes an element from its parent with remove()', () => {
    let a = createItem(doc, 'a');
    let b = createItem(doc, 'b');
    doc.appendChild(a);
    doc.appendChild(b);
    expect(getKeys(doc)).toEqual(['a', 'b']);

    a.remove();
    expect(a.parentNode).toBeNull();
    expect(getKeys(doc)).toEqual(['b']);
  });

  it('ignores text nodes in the collection', () => {
    let text = doc.createTextNode(' ');
    expect(text.nodeType).toBe(3);
    expect(text.data).toBe(' ');

    doc.appendChild(text);
    doc.appendChild(createItem(doc, 'a'));
    doc.appendChild(doc.createTextNode('0'));
    doc.appendChild(createItem(doc, 'b'));

    expect(getKeys(doc)).toEqual(['a', 'b']);
    expect(doc.getCollection().getItem('b').prevKey).toBe('a');
    expect(doc.getCollection().size).toBe(2);
    expect(doc.dirtyNodes.size).toBe(0);

    text.nodeValue = 'updated';
    expect(text.data).toBe('updated');

    text.remove();
    expect(getKeys(doc)).toEqual(['a', 'b']);
    expect(doc.dirtyNodes.size).toBe(0);
  });
});
