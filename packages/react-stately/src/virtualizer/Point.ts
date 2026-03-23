/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export class Point {
  /** The x-coordinate of the point. */
  x: number;

  /** The y-coordinate of the point. */
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns a copy of this point.
   */
  copy(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Checks if two points are equal.
   */
  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  /**
   * Returns true if this point is the origin.
   */
  isOrigin(): boolean {
    return this.x === 0 && this.y === 0;
  }
}
