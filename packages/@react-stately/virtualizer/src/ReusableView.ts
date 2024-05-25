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

import {Key} from '@react-types/shared';
import {LayoutInfo} from './LayoutInfo';
import {Virtualizer} from './Virtualizer';

let KEY = 0;

/**
 * [Virtualizer]{@link Virtualizer} creates instances of the [ReusableView]{@link ReusableView} class to
 * represent views currently being displayed.
 */
export class ReusableView<T extends object, V> {
  /** The Virtualizer this view is a part of. */
  virtualizer: Virtualizer<T, V, unknown>;

  /** The LayoutInfo this view is currently representing. */
  layoutInfo: LayoutInfo | null;

  /** The content currently being displayed by this view, set by the virtualizer. */
  content: T;

  rendered: V;

  viewType: string;
  key: Key;

  parent: ReusableView<T, V> | null;
  children: Set<ReusableView<T, V>>;
  reusableViews: Record<string, ReusableView<T, V>[]>;

  constructor(virtualizer: Virtualizer<T, V, unknown>) {
    this.virtualizer = virtualizer;
    this.key = ++KEY;
    this.parent = null;
    this.children = new Set();
    this.reusableViews = {};
  }

  /**
   * Prepares the view for reuse. Called just before the view is removed from the DOM.
   */
  prepareForReuse() {
    this.content = null;
    this.rendered = null;
    this.layoutInfo = null;
  }

  getReusableView(reuseType: string) {
    let reusable = this.reusableViews[reuseType];
    let view = reusable?.length > 0
      ? reusable.pop()
      : new ReusableView<T, V>(this.virtualizer);

    view.viewType = reuseType;
    view.parent = this;
    return view;
  }

  reuseChild(child: ReusableView<T, V>) {
    child.prepareForReuse();
    this.reusableViews[child.viewType] ||= [];
    this.reusableViews[child.viewType].push(child);
  }
}
