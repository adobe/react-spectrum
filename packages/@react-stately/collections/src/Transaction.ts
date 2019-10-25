import {Key} from 'react';
import {LayoutInfo} from './LayoutInfo';
import {ReusableView} from './ReusableView';

type LayoutInfoMap = Map<Key, LayoutInfo>;
export class Transaction<T, V> {
  level = 0;
  actions: (() => void)[] = [];
  animated = true;
  initialMap: LayoutInfoMap = new Map();
  finalMap: LayoutInfoMap = new Map();
  initialLayoutInfo: LayoutInfoMap = new Map();
  finalLayoutInfo: LayoutInfoMap = new Map();
  removed: Map<Key, ReusableView<T, V>> = new Map();
  toRemove: Map<Key, ReusableView<T, V>> = new Map();
}
