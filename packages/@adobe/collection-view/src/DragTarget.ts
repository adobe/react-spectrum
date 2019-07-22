export enum DropPosition {
  ON = 1 << 0,
  BETWEEN = 1 << 1,
  ANY = ON | BETWEEN
}

/**
 * Describes a view to be dragged or dropped.
 */
export class DragTarget {
  /** The type of view being dragged or dropped */
  type: string;

  /** The key of the view being dragged or dropped */
  key: string;

  /** The position of the drop. Either BETWEEN or ON. BETWEEN by default. */
  dropPosition: DropPosition;

  /**
   * @param type the type of view being dragged or dropped
   * @param key the key of the view being dragged or dropped
   * @param dropPosition The position of the drop. Either BETWEEN or ON.
   */
  constructor(type: string, key: string, dropPosition = DropPosition.BETWEEN) {
    this.type = type;
    this.key = key;
    this.dropPosition = dropPosition;
  }

  /**
   * Returns whether this DragTarget is equal to another one
   * @param other the target to compare
   */
  equals(other: DragTarget): boolean {
    return other instanceof DragTarget
        && other.type === this.type
        && other.dropPosition === this.dropPosition
        && other.key === this.key;
  }

  /**
   * Returns a copy of this drag target.
   */
  copy(): DragTarget {
    return new DragTarget(this.type, this.key, this.dropPosition);
  }
}
