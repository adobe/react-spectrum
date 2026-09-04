/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export type BoundingNode = Element | Document;

export type Axis = 'block' | 'inline';
export type Precision = 'pixel' | 'sub-pixel' | 'device-pixel';
export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type Position = 'start' | 'center' | 'end';

export interface BoundingOptions {
  /** The pixel precision to calculate the bound with. */
  precision?: Precision;
  /** Whether or not to allow 2D transforms on the bound. */
  transform?: boolean;
  /** The box-model to use when bounding. */
  model?: BoxModel;
}

export type BoxModel =
  | 'margin-box'
  | 'scroll-margin-box'
  | 'border-box'
  | 'padding-box'
  | 'scroll-padding-box'
  | 'content-box';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}
