import {Item} from './Item';
import {Section} from './Section';

type TreeItem = Section | Item;
type LoadFunction<T> = (item: Item) => T[] | Promise<T[]>;
interface TreeOptions {
  children?: TreeItem[],
  load?: LoadFunction<TreeItem[]>,
  loadMore?: LoadFunction<TreeItem[]>
}

export class Tree {
  private children?: TreeItem[];
  private load?: LoadFunction<TreeItem[]>;
  private loadMore?: LoadFunction<TreeItem[]>;

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
  }
}
