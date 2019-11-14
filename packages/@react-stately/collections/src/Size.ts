/**
 * Represents a 2d size, with a width and height.
 */
export class Size {
  width: number;
  height: number;

  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
  }
  
  /**
   * Returns a copy of this size
   */
  copy(): Size {
    return new Size(this.width, this.height);
  }
  
  /**
   * Returns whether this size is equal to another one
   */
  equals(other: Size): boolean {
    return this.width === other.width 
        && this.height === other.height;
  }
}
