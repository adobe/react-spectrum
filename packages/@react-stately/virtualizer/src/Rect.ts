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

import {Point} from './Point';
import {Size} from './Size';

export type RectCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/**
 * Represents a rectangle.
 */
export class Rect {
  /** The x-coordinate of the rectangle. */
  x: number;

  /** The y-coordinate of the rectangle. */
  y: number;

  /** The width of the rectangle. */
  width: number;

  /** The height of the rectangle. */
  height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * The maximum x-coordinate in the rectangle.
   */
  get maxX(): number {
    return this.x + this.width;
  }

  /**
   * The maximum y-coordinate in the rectangle.
   */
  get maxY(): number {
    return this.y + this.height;
  }

  /**
   * The area of the rectangle.
   */
  get area(): number {
    return this.width * this.height;
  }

  /**
   * The top left corner of the rectangle.
   */
  get topLeft(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * The top right corner of the rectangle.
   */
  get topRight(): Point {
    return new Point(this.maxX, this.y);
  }

  /**
   * The bottom left corner of the rectangle.
   */
  get bottomLeft(): Point {
    return new Point(this.x, this.maxY);
  }

  /**
   * The bottom right corner of the rectangle.
   */
  get bottomRight(): Point {
    return new Point(this.maxX, this.maxY);
  }

  /**
   * Returns whether this rectangle intersects another rectangle.
   * @param rect - The rectangle to check.
   */
  intersects(rect: Rect): boolean {
    return this.x <= rect.x + rect.width
        && rect.x <= this.x + this.width
        && this.y <= rect.y + rect.height
        && rect.y <= this.y + this.height;
  }

  /**
   * Returns whether this rectangle fully contains another rectangle.
   * @param rect - The rectangle to check.
   */
  containsRect(rect: Rect): boolean {
    return this.x <= rect.x
        && this.y <= rect.y
        && this.maxX >= rect.maxX
        && this.maxY >= rect.maxY;
  }

  /**
   * Returns whether the rectangle contains the given point.
   * @param point - The point to check.
   */
  containsPoint(point: Point): boolean {
    return this.x <= point.x
        && this.y <= point.y
        && this.maxX >= point.x
        && this.maxY >= point.y;
  }

  /**
   * Returns the first corner of this rectangle (from top to bottom, left to right)
   * that is contained in the given rectangle, or null of the rectangles do not intersect.
   * @param rect - The rectangle to check.
   */
  getCornerInRect(rect: Rect): RectCorner | null {
    for (let key of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']) {
      if (rect.containsPoint(this[key])) {
        return key as RectCorner;
      }
    }

    return null;
  }

  equals(rect: Rect) {
    return rect.x === this.x
        && rect.y === this.y
        && rect.width === this.width
        && rect.height === this.height;
  }

  pointEquals(point: Point | Rect) {
    return this.x === point.x
        && this.y === point.y;
  }

  sizeEquals(size: Size | Rect) {
    return this.width === size.width
        && this.height === size.height;
  }

  /**
   * Returns a copy of this rectangle.
   */
  copy(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}
