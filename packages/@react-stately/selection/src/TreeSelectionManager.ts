import {Collection, Key, Node} from '@react-types/shared';
import {SelectionManager} from './SelectionManager';
import {TreeSelectionState} from './types';

export class TreeSelectionManager extends SelectionManager {
  protected state: TreeSelectionState;

  constructor(collection: Collection<Node<unknown>>, state: TreeSelectionState) {
    super(collection, state);
    this.state = state;
  }

  isIndeterminate(key: Key): boolean {
    const mappedKey = this.getKey(key);
    if (mappedKey == null) {
      return false;
    }
    return this.state.indeterminateKeys.has(mappedKey);
  }
}
