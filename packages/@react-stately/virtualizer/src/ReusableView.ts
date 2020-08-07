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

import {Key} from 'react';
import {LayoutInfo} from './LayoutInfo';
import {Virtualizer} from './Virtualizer';

let KEY = 0;

/**
 * [CollectionView]{@link CollectionView} creates instances of the [ReusableView]{@link ReusableView} class to
 * represent views currently being displayed. ReusableViews manage a DOM node, handle
 * applying {@link LayoutInfo} objects to the view, and render content
 * as needed. Subclasses must implement the {@link render} method at a
 * minimum. Other methods can be overridden to customize behavior.
 */
export class ReusableView<T extends object, V> {
  /** The CollectionVirtualizer this view is a part of. */
  virtualizer: Virtualizer<T, V, unknown>;

  /** The LayoutInfo this view is currently representing. */
  layoutInfo: LayoutInfo | null;

  /** The content currently being displayed by this view, set by the collection view. */
  content: T;

  rendered: V;

  viewType: string;
  key: Key;

  constructor(virtualizer: Virtualizer<T, V, unknown>) {
    this.virtualizer = virtualizer;
    this.key = ++KEY;
  }

  /**
   * Prepares the view for reuse. Called just before the view is removed from the DOM.
   */
  prepareForReuse() {
    this.content = null;
    this.rendered = null;
    this.layoutInfo = null;
  }
}
