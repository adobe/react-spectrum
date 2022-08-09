import {DropTarget} from '@react-types/shared';
import {Key, RefObject} from 'react';

type DropEffect = 'none' | 'copy' | 'link' | 'move';

export interface DnDState {
  /** A ref for the  of the drag items in the current drag session if any. */
  draggingCollectionRef?: RefObject<HTMLElement>,
  /** The set of currently dragged keys. */
  draggingKeys: Set<Key>,
  /** The current collection being hovered/focused for a potential drop operation. */
  currentDropCollectionRef?: RefObject<HTMLElement>,
  /** A ref for the collection the dragged items were dropped into, if any. */
  droppedCollectionRef?: RefObject<HTMLElement>,
  /** The specific drop target the dragged items were dropped into, if any. */
  droppedTarget?: DropTarget | HTMLElement,
  /** The dropEffect of the drop event if any. */
  dropEffect?: DropEffect
}

let dndState: DnDState = {draggingKeys: new Set()};

// TODO naming? maybe getGlobalDnDState?
export function getDnDState(): DnDState {
  return dndState;
}

export function setDraggingCollectionRef(ref: RefObject<HTMLElement>) {
  dndState.draggingCollectionRef = ref;
}

export function setDraggingKeys(keys: Set<Key>) {
  dndState.draggingKeys = keys;
}

export function setCurrentDropCollectionRef(ref: RefObject<HTMLElement>) {
  dndState.currentDropCollectionRef = ref;
}

export function setDroppedCollectionRef(ref: RefObject<HTMLElement>) {
  dndState.droppedCollectionRef = ref;
}

export function setDroppedTarget(dropTarget: DropTarget | HTMLElement) {
  dndState.droppedTarget = dropTarget;
}

export function setDropEffect(dropEffect: DropEffect) {
  dndState.dropEffect = dropEffect;
}

export function clearDnDState() {
  dndState = {draggingKeys: new Set()};
}

export function setDnDState(state: DnDState) {
  dndState = state;
}
