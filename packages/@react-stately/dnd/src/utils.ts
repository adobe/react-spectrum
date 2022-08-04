import {Collection, DropTarget, Node} from '@react-types/shared';
import {Key} from 'react';

export interface DnDState {
  /** The source collection of the drag items in the current drag session if any. */
  draggingCollection?: Collection<Node<unknown>>,
  /** The set of currently dragged keys. */
  draggingKeys: Set<Key>,
  /** The collection the dragged items were dropped into if any. */
  droppedCollection?: Collection<Node<unknown>>,
  /** The specific drop target the dragged items were dropped into if any. */
  droppedTarget?: DropTarget | HTMLElement
}
// Track here instead of in aria cuz circular dep. Also don't track in drag hooks cuz we only need one global tracker
let dndState: DnDState = {draggingKeys: new Set()};


// TODO naming? maybe getGlobalDnDState?
export function getDnDState(): DnDState {
  return dndState;
}

export function setDraggingCollection(collection: Collection<Node<unknown>>) {
  dndState.draggingCollection = collection;
}

export function setDraggingKeys(keys: Set<Key>) {
  dndState.draggingKeys = keys;
}

export function setDroppedCollection(collection: Collection<Node<unknown>>) {
  dndState.droppedCollection = collection;
}

export function setDroppedTarget(dropTarget: DropTarget | HTMLElement) {
  dndState.droppedTarget = dropTarget;
}
