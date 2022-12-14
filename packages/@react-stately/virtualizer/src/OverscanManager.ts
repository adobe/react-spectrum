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
import {Rect} from './Rect';

class RollingAverage {
  private count: number;
  value: number;

  constructor() {
    this.count = 0;
    this.value = 0;
  }

  addSample(sample: number) {
    this.count++;
    this.value += (sample - this.value) / this.count;
  }
}

export class OverscanManager {
  private startTime;
  private averagePerf;
  private averageTime;
  private velocity;
  private overscanX;
  private overscanY;
  private visibleRect;

  constructor() {
    this.startTime = 0;
    this.averagePerf = new RollingAverage();
    this.averageTime = new RollingAverage();
    this.velocity = new Point(5, 5);
    this.overscanX = new RollingAverage();
    this.overscanY = new RollingAverage();
    this.visibleRect = new Rect();
  }

  setVisibleRect(rect: Rect) {
    let time = performance.now() - this.startTime;
    if (time < 500) {
      this.averageTime.addSample(time);

      if (rect.x !== this.visibleRect.x && time > 0) {
        this.velocity.x = (rect.x - this.visibleRect.x) / time;
      }

      if (rect.y !== this.visibleRect.y && time > 0) {
        this.velocity.y = (rect.y - this.visibleRect.y) / time;
      }
    }

    this.startTime = performance.now();
    this.visibleRect = rect;
  }

  collectMetrics() {
    let time = performance.now() - this.startTime;
    if (time < 500) {
      this.averagePerf.addSample(time);
    }

    if (this.visibleRect.height > 0) {
      let o = Math.abs(this.velocity.y * (this.averageTime.value + this.averagePerf.value));
      this.overscanY.addSample(o);
    }

    if (this.visibleRect.width > 0) {
      let o = Math.abs(this.velocity.x * (this.averageTime.value + this.averagePerf.value));
      this.overscanX.addSample(o);
    }
  }

  getOverscannedRect() {
    let overscanned = this.visibleRect.copy();

    let overscanY = Math.round(Math.min(this.visibleRect.height * 2, this.overscanY.value) / 100) * 100;
    if (this.velocity.y > 0) {
      overscanned.y -= overscanY * 0.2;
      overscanned.height += overscanY + overscanY * 0.2;
    } else {
      overscanned.y -= overscanY;
      overscanned.height += overscanY + overscanY * 0.2;
    }

    let overscanX = Math.round(Math.min(this.visibleRect.width * 2, this.overscanX.value) / 100) * 100;
    if (this.velocity.x > 0) {
      overscanned.x -= overscanX * 0.2;
      overscanned.width += overscanX + overscanX * 0.2;
    } else {
      overscanned.x -= overscanX;
      overscanned.width += overscanX + overscanX * 0.2;
    }

    return overscanned;
  }
}
