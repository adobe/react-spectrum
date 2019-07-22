import {Item} from './Item';

type LoadFunction<T> = (item: Item) => T[] | Promise<T[]>;
interface SectionOptions {
  key?: any,
  value?: any,
  children?: Item[],
  load?: LoadFunction<Item[]>,
  loadMore?: LoadFunction<Item[]>
}

export class Section {
  key?: any;
  value?: any;
  isLoading: boolean;
  children: Item[];
  load?: LoadFunction<Item[]>;
  loadMore?: LoadFunction<Item[]>;

  constructor(opts: SectionOptions, load: LoadFunction<Item[]>);
  constructor(opts: SectionOptions, ...children: Item[]);
  constructor(opts: SectionOptions, ...children: any[]) {
    this.key = opts.key || opts.value;
    this.isLoading = false;
    if (typeof children[0] === 'function') {
      this.load = children[0];
    } else {
      this.children = opts.children || children;
      this.load = opts.load;
      this.loadMore = opts.loadMore;
    }
  }

  copy(opts: SectionOptions) {
    return new Section(Object.assign({}, this, opts));
  }
}
