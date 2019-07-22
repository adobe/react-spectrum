import {Item, ItemOptions} from './Item';
import {Section} from './Section';

type TreeItem = Section | Item;
type LoadFunction<T> = (item: Item) => T[] | Promise<T[]>;
interface TreeOptions {
  children?: TreeItem[],
  load?: LoadFunction<TreeItem[]>,
  loadMore?: LoadFunction<TreeItem[]>
}

export class Tree {
  children: Item[];
  load?: LoadFunction<TreeItem[]>;
  loadMore?: LoadFunction<TreeItem[]>;
  private map: Map<string, any> | null;

  constructor(opts?: TreeOptions);
  constructor(load?: LoadFunction<TreeItem[]>);
  constructor(...children: TreeItem[]);
  constructor(...args: any[]) {
    if (typeof args[0] === 'function') {
      this.load = args[0];
    } else if (args[0] instanceof Item) {
      this.children = args;
    } else {
      let opts = args[0];
      this.children = opts.children;
      this.load = opts.load;
      this.loadMore = opts.loadMore;
    }

    this.map = null;
  }

  copy(opts: TreeOptions) {
    return new Tree(Object.assign({}, this, opts));
  }

  update(key, changes: ItemOptions) {
    let oldItem = this.getItem(key);
    let item = oldItem.copy(changes);
    let parents = this.getMap().get(key).parents;
    for (let i = parents.length - 1; i >= 0; i--) {
      let children = parents[i].children.map(i => i === oldItem ? item : i);
      oldItem = parents[i];
      item = oldItem.copy({
        children
      });
    }

    return item;
  }

  private getMap() {
    if (this.map) {
      return this.map;
    }

    let map = new Map();

    let walk = (parents: (Tree | Section | Item)[], node: Tree | Section | Item) => {
      if (node instanceof Item) {
        map.set(node.key, {parents, node});
      }

      if (!(node instanceof Item) || node.isExpanded) {
        let p = [...parents, node];
        for (let child of node.children) {
          walk(p, child);
        }
      }
    };
    
    walk([], this);
    this.map = map;
    return this.map;
  }

  getKeys() {
    return this.getMap().keys();
  }

  getItem(key) {
    let item = this.getMap().get(key);
    if (item) {
      return item.node;
    }
  }

  getLevel(key) {
    let item = this.getMap().get(key);
    if (item) {
      return item.parents.length - 1;
    }

    return 0;
  }
}
