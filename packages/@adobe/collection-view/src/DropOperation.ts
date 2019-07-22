/**
 * The DropOperation constants are used to represent the types of drops that are allowed.
 */
export enum DropOperation {
  /** The drop is not allowed. */
  NONE = 0,

  /** The dropped data can be moved between the source and destination. */
  MOVE = 1 << 0,

  /** The dropped data can be copied between the source and destination. */
  COPY = 1 << 1,

  /** The dropped data can be shared between the source and destination. */
  LINK = 1 << 2,

  /** All types of drops are allowed. */
  ALL = MOVE | COPY | LINK
}
