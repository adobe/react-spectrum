import {Collection, DropTarget, Key, KeyboardDelegate, Node} from '@react-types/shared';
import {createRef} from 'react';
import {ListKeyboardDelegate} from 'react-aria';
import {navigate} from '../src/DropTargetKeyboardNavigation';

interface Item {
  id: string,
  name: string,
  childItems?: Item[]
}

let rows: Item[] = [
  {id: 'projects', name: 'Projects', childItems: [
    {id: 'project-1', name: 'Project 1'},
    {id: 'project-2', name: 'Project 2', childItems: [
      {id: 'project-2A', name: 'Project 2A'},
      {id: 'project-2B', name: 'Project 2B'},
      {id: 'project-2C', name: 'Project 2C'}
    ]},
    {id: 'project-3', name: 'Project 3'},
    {id: 'project-4', name: 'Project 4'},
    {id: 'project-5', name: 'Project 5', childItems: [
      {id: 'project-5A', name: 'Project 5A'},
      {id: 'project-5B', name: 'Project 5B'},
      {id: 'project-5C', name: 'Project 5C'}
    ]}
  ]},
  {id: 'reports', name: 'Reports', childItems: [
    {id: 'reports-1', name: 'Reports 1', childItems: [
      {id: 'reports-1A', name: 'Reports 1A', childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC'}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B'},
      {id: 'reports-1C', name: 'Reports 1C'}
    ]},
    {id: 'reports-2', name: 'Reports 2'}
  ]}
];

// Collection implementation backed by item objects above.
// This way we don't need to render React components to test.
class TestCollection implements Collection<Node<Item>> {
  map: Map<Key, Node<Item>>;
  rootNodes: Node<Item>[];

  constructor(items: Item[]) {
    this.map = new Map<Key, Node<Item>>();
    let visitItem = (item: Item, index: number, level = 0, parentKey: string | null = null): Node<Item> => {
      let childNodes = item.childItems ? visitItems(item.childItems, level + 1, item.id) : [];
      return {
        type: 'item',
        key: item.id,
        value: item,
        level: level,
        hasChildNodes: childNodes.length > 0,
        childNodes,
        rendered: null,
        textValue: '',
        index,
        parentKey
      };
    };

    let visitItems = (items: Item[], level: number, parentKey: string | null): Node<Item>[] => {
      let last: Node<Item> | null = null;
      let index = 0;
      let nodes: Node<Item>[] = [];
      for (let item of items) {
        let node = visitItem(item, index, level, parentKey);
        this.map.set(item.id, node);
        nodes.push(node);
        node.prevKey = last?.key;
        if (last) {
          last.nextKey = node.key;
        }
        last = node;
        index++;
      }

      return nodes;
    };

    this.rootNodes = visitItems(items, 0, null);
  }

  get size(): number {
    return this.map.size;
  }

  getKeys(): Iterable<Key> {
    return this.map.keys();
  }

  [Symbol.iterator]() {
    return this.rootNodes.values();
  }

  at(): Node<Item> | null {
    throw new Error();
  }

  getItem(key: Key): Node<Item> | null {
    return this.map.get(key) ?? null;
  }

  getFirstKey(): Key | null {
    return this.rootNodes[0]?.key ?? null;
  }

  getLastKey(): Key | null {
    let lastNode = this.rootNodes.at(-1);
    let lastKey = lastNode?.prevKey;
    while (lastNode?.hasChildNodes) {
      lastNode = Array.from(lastNode.childNodes).at(-1);
      lastKey = lastNode!.key;
    }

    return lastKey ?? null;
  }

  getKeyBefore(key: Key): Key | null {
    let item = this.map.get(key);
    if (!item) {
      return null;
    }

    if (item.prevKey == null) {
      return item.parentKey ?? null;
    }

    let prevKey = item.prevKey;
    let prevNode = this.map.get(prevKey);
    while (prevNode?.hasChildNodes) {
      prevNode = Array.from(prevNode.childNodes).at(-1);
      prevKey = prevNode!.key;
    }

    return prevKey;
  }

  getKeyAfter(key: Key): Key | null {
    let item = this.map.get(key);
    if (!item) {
      return null;
    }

    if (item.hasChildNodes) {
      return item.childNodes[0].key;
    }

    if (item.nextKey != null) {
      return item.nextKey;
    }

    let parentKey = item.parentKey;
    while (parentKey != null) {
      let parentNode = this.map.get(parentKey)!;
      if (parentNode.nextKey != null) {
        return parentNode.nextKey;
      }
      parentKey = parentNode.parentKey;
    }

    return null;
  }

  getChildren(key: Key): Iterable<Node<Item>> {
    let item = this.map.get(key);
    return item?.childNodes ?? [];
  }
}

let collection = new TestCollection(rows);
let expectedTargets = [
  {type: 'root'},
  {type: 'item', key: 'projects', dropPosition: 'before'},
  {type: 'item', key: 'projects', dropPosition: 'on'},
  {type: 'item', key: 'project-1', dropPosition: 'before'},
  {type: 'item', key: 'project-1', dropPosition: 'on'},
  {type: 'item', key: 'project-2', dropPosition: 'before'},
  {type: 'item', key: 'project-2', dropPosition: 'on'},
  {type: 'item', key: 'project-2A', dropPosition: 'before'},
  {type: 'item', key: 'project-2A', dropPosition: 'on'},
  {type: 'item', key: 'project-2B', dropPosition: 'before'},
  {type: 'item', key: 'project-2B', dropPosition: 'on'},
  {type: 'item', key: 'project-2C', dropPosition: 'before'},
  {type: 'item', key: 'project-2C', dropPosition: 'on'},
  {type: 'item', key: 'project-2C', dropPosition: 'after'},
  {type: 'item', key: 'project-3', dropPosition: 'before'},
  {type: 'item', key: 'project-3', dropPosition: 'on'},
  {type: 'item', key: 'project-4', dropPosition: 'before'},
  {type: 'item', key: 'project-4', dropPosition: 'on'},
  {type: 'item', key: 'project-5', dropPosition: 'before'},
  {type: 'item', key: 'project-5', dropPosition: 'on'},
  {type: 'item', key: 'project-5A', dropPosition: 'before'},
  {type: 'item', key: 'project-5A', dropPosition: 'on'},
  {type: 'item', key: 'project-5B', dropPosition: 'before'},
  {type: 'item', key: 'project-5B', dropPosition: 'on'},
  {type: 'item', key: 'project-5C', dropPosition: 'before'},
  {type: 'item', key: 'project-5C', dropPosition: 'on'},
  {type: 'item', key: 'project-5C', dropPosition: 'after'},
  {type: 'item', key: 'project-5', dropPosition: 'after'},
  {type: 'item', key: 'reports', dropPosition: 'before'},
  {type: 'item', key: 'reports', dropPosition: 'on'},
  {type: 'item', key: 'reports-1', dropPosition: 'before'},
  {type: 'item', key: 'reports-1', dropPosition: 'on'},
  {type: 'item', key: 'reports-1A', dropPosition: 'before'},
  {type: 'item', key: 'reports-1A', dropPosition: 'on'},
  {type: 'item', key: 'reports-1AB', dropPosition: 'before'},
  {type: 'item', key: 'reports-1AB', dropPosition: 'on'},
  {type: 'item', key: 'reports-1ABC', dropPosition: 'before'},
  {type: 'item', key: 'reports-1ABC', dropPosition: 'on'},
  {type: 'item', key: 'reports-1ABC', dropPosition: 'after'},
  {type: 'item', key: 'reports-1AB', dropPosition: 'after'},
  {type: 'item', key: 'reports-1B', dropPosition: 'before'},
  {type: 'item', key: 'reports-1B', dropPosition: 'on'},
  {type: 'item', key: 'reports-1C', dropPosition: 'before'},
  {type: 'item', key: 'reports-1C', dropPosition: 'on'},
  {type: 'item', key: 'reports-1C', dropPosition: 'after'},
  {type: 'item', key: 'reports-2', dropPosition: 'before'},
  {type: 'item', key: 'reports-2', dropPosition: 'on'},
  {type: 'item', key: 'reports-2', dropPosition: 'after'},
  {type: 'item', key: 'reports', dropPosition: 'after'}
];

describe('drop target keyboard navigation', () => {
  it('sanity test collection', () => {
    let nextKeys: Key[] = [];
    let key = collection.getFirstKey();
    while (key != null) {
      nextKeys.push(key);
      key = collection.getKeyAfter(key);
    }

    let expectedKeys = [
      'projects',
      'project-1',
      'project-2',
      'project-2A',
      'project-2B',
      'project-2C',
      'project-3',
      'project-4',
      'project-5',
      'project-5A',
      'project-5B',
      'project-5C',
      'reports',
      'reports-1',
      'reports-1A',
      'reports-1AB',
      'reports-1ABC',
      'reports-1B',
      'reports-1C',
      'reports-2'
    ];
    
    expect(nextKeys).toEqual(expectedKeys);

    let prevKeys: Key[] = [];
    key = collection.getLastKey();
    while (key != null) {
      prevKeys.push(key);
      key = collection.getKeyBefore(key);
    }

    expect(prevKeys).toEqual(expectedKeys.toReversed());
  });

  function collect(keyboardDelegate: KeyboardDelegate, direction: 'up' | 'down' | 'left' | 'right', rtl = false) {
    let results: DropTarget[] = [];
    let target: DropTarget | null = null;
    do {
      target = navigate(keyboardDelegate, collection, target, direction, rtl);
      if (target != null) {
        results.push(target);
      }
    } while (target != null);
    return results;
  }

  it('should navigate forward vertically', () => {
    let keyboardDelegate = new ListKeyboardDelegate(collection, new Set(), createRef());
    let results = collect(keyboardDelegate, 'down');
    expect(results).toEqual(expectedTargets);
  });

  it('should navigate backward vertically', () => {
    let keyboardDelegate = new ListKeyboardDelegate(collection, new Set(), createRef());
    let results = collect(keyboardDelegate, 'up');
    expect(results.toReversed()).toEqual(expectedTargets);
  });

  it('should navigate forward horizontally (ltr)', () => {
    let keyboardDelegate = new ListKeyboardDelegate({
      collection,
      ref: createRef(),
      orientation: 'horizontal',
      direction: 'ltr'
    });

    let results = collect(keyboardDelegate, 'right');
    expect(results).toEqual(expectedTargets);
  });

  it('should navigate forward horizontally (rtl)', () => {
    let keyboardDelegate = new ListKeyboardDelegate({
      collection,
      ref: createRef(),
      orientation: 'horizontal',
      direction: 'rtl'
    });

    let results = collect(keyboardDelegate, 'left', true);
    expect(results).toEqual(expectedTargets);
  });

  it('should navigate backward horizontally (ltr)', () => {
    let keyboardDelegate = new ListKeyboardDelegate({
      collection,
      ref: createRef(),
      orientation: 'horizontal',
      direction: 'ltr'
    });

    let results = collect(keyboardDelegate, 'left');
    expect(results.toReversed()).toEqual(expectedTargets);
  });

  it('should navigate backward horizontally (rtl)', () => {
    let keyboardDelegate = new ListKeyboardDelegate({
      collection,
      ref: createRef(),
      orientation: 'horizontal',
      direction: 'rtl'
    });

    let results = collect(keyboardDelegate, 'right', true);
    expect(results.toReversed()).toEqual(expectedTargets);
  });
});
