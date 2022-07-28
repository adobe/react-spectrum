import {Collection, DropTarget, Node} from '@react-types/shared';

interface DnDState {
  /** The source collection of the drag items in the current drag session if any. */
  draggedCollection?: Collection<Node<unknown>>,
  /** The collection the dragged items were dropped into if any. */
  droppedCollection?: Collection<Node<unknown>>,
  /** The specific drop target the dragged items were dropped into if any. */
  droppedTarget?: DropTarget | HTMLElement
}
// Track here instead of in aria cuz circular dep. Also don't track in drag hooks cuz we only need one global tracker
let dndState: DnDState = {};


// TODO naming? maybe getGlobalDnDState?
export function getDnDState(): DnDState {
  return dndState;
}

export function setDraggedCollection(collection: Collection<Node<unknown>>) {
  dndState.draggedCollection = collection;
}

export function setDroppedCollection(collection: Collection<Node<unknown>>) {
  dndState.droppedCollection = collection;
}

export function setDroppedTarget(dropTarget: DropTarget | HTMLElement) {
  dndState.droppedTarget = dropTarget;
}
