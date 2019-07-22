import {LayoutInfo} from './LayoutInfo';
import ReusableView from './ReusableView';

type LayoutInfoMap = Map<string, LayoutInfo>;
export class Transaction {
  level = 0;
  actions: (() => void)[] = [];
  animated = true;
  initialMap: LayoutInfoMap = new Map();
  finalMap: LayoutInfoMap = new Map();
  initialLayoutInfo: LayoutInfoMap = new Map();
  finalLayoutInfo: LayoutInfoMap = new Map();
  removed: Map<string, ReusableView> = new Map();
  toRemove: Map<string, ReusableView> = new Map();
}
