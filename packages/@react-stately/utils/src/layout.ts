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

import {Corner, Point as IPoint, Rect as IRect, Size as ISize} from '@react-types/shared';

/**
 * Represents a point.
 */
export class Point implements IPoint {
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
   * Returns the distance between two points.
   */
  distance(point: Point): number {
    return Math.abs(Math.hypot(this.x - point.x, this.y - point.y));
  }

  /**
   * Returns true if this point is the origin.
   */
  isOrigin(): boolean {
    return this.x === 0 && this.y === 0;
  }
}

/**
 * Represents a size.
 */
export class Size implements ISize {
  width: number;
  height: number;

  constructor(width = 0, height = 0) {
    this.width = Math.min(Math.max(width, 0), Number.MAX_SAFE_INTEGER) || 0;
    this.height = Math.min(Math.max(height, 0), Number.MAX_SAFE_INTEGER) || 0;
  }

  /**
   * Returns a copy of this size.
   */
  copy(): Size {
    return new Size(this.width, this.height);
  }

  /**
   * Returns whether this size is smaller than another one.
   */
  smaller(other: ISize): boolean {
    return this.width < other.width
      || this.height < other.height;
  }

  /**
   * Returns whether this size is equal to another one.
   */
  equals(other: ISize): boolean {
    return this.width === other.width
      && this.height === other.height;
  }

  /**
   * Returns whether this size is larger than another one.
   */
  larger(other: ISize): boolean {
    return this.width > other.width
      || this.height > other.height;
  }

  /**
   * The total area of the Size.
   */
  get area(): number {
    return this.width * this.height;
  }
}

/**
 * Represents a rectangle.
 */
export class Rect implements IRect {
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
   * The size of the rectangle.
   */
  get size(): Size {
    return new Size(this.width, this.height);
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
   * The center of the rectangle.
   */
  get center(): Point {
    return new Point(this.maxX / 2, this.maxY / 2);
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
  intersects(rect: IRect): boolean {
    return (this.area > 0 && (rect.width * rect.height) > 0)
      && this.x <= rect.x + rect.width
      && rect.x <= this.x + this.width
      && this.y <= rect.y + rect.height
      && rect.y <= this.y + this.height;
  }

  /**
   * Returns whether this rectangle fully contains another rectangle.
   * @param rect - The rectangle to check.
   */
  containsRect(rect: IRect): boolean {
    return this.x <= rect.x
      && this.y <= rect.y
      && this.maxX >= rect.x + rect.width
      && this.maxY >= rect.y + rect.height;
  }

  /**
   * Returns whether the rectangle contains the given point.
   * @param point - The point to check.
   */
  containsPoint(point: IPoint): boolean {
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
  getCornerInRect(rect: IRect): Corner | null {
    let other = new Rect(rect.x, rect.y, rect.width, rect.height);
    for (let key of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']) {
      if (other.containsPoint(this[key])) {
        return key as Corner;
      }
    }

    return null;
  }

  /**
   * Returns whether this rectangle is equal to another rectangle.
   */
  equals(rect: IRect): boolean {
    return rect.x === this.x
      && rect.y === this.y
      && rect.width === this.width
      && rect.height === this.height;
  }

  /**
   * Returns whether this rectangle is equal to a point.
   */
  pointEquals(point: IPoint | IRect): boolean {
    return this.x === point.x
      && this.y === point.y;
  }

  /**
   * Returns whether this rectangle is equal to a size.
   */
  sizeEquals(size: ISize | IRect): boolean {
    return this.width === size.width
      && this.height === size.height;
  }

  /**
   * Returns the union of this Rect and another.
   */
  union(other: IRect): Rect {
    let x = Math.min(this.x, other.x);
    let y = Math.min(this.y, other.y);
    let width = Math.max(this.maxX, other.x + other.width) - x;
    let height = Math.max(this.maxY, other.y + other.height) - y;
    return new Rect(x, y, width, height);
  }

  /**
   * Returns the intersection of this Rect with another.
   * If the rectangles do not intersect, an all zero Rect is returned.
   */
  intersection(other: IRect): Rect {
    if (!this.intersects(other)) {
      return new Rect(0, 0, 0, 0);
    }

    let x = Math.max(this.x, other.x);
    let y = Math.max(this.y, other.y);
    let width = Math.min(this.maxX, other.x + other.width) - x;
    let height = Math.min(this.maxY, other.y + other.height) - y;
    return new Rect(x, y, width, height);
  }

  /**
   * Returns a copy of this rectangle.
   */
  copy(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}
