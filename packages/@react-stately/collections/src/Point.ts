/**
 * Represents a 2d point
 */
export class Point {
  /** The x-coordinate of the point */
  x: number;

  /** The y-coordinate of the point */
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  /**
   * Returns a copy of this point
   */
  copy(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Checks if two points are equal
   */
  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  /**
   * Returns true if this point is the origin
   */
  isOrigin(): boolean {
    return this.x === 0 && this.y === 0;
  }
}
