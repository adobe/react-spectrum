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

import {useLayoutEffect} from './useLayoutEffect';
import {useState} from 'react';

let elementId = 0;
const nodes = new Map<string, {refCount: number, element: HTMLElement}>();

// This function generates a hidden span element containing with an id that can be
// pointed to by aria-labelledby or aria-describedby.
export function useHiddenText(label: string): string {
  let [id, setId] = useState(null);

  useLayoutEffect(() => {
    if (!label) {
      return;
    }

    let node = nodes.get(label);
    if (!node) {
      let id = `react-aria-description-${elementId++}`;
      setId(id);

      let span = document.createElement('span');
      span.id = id;
      span.style.display = 'none';
      span.textContent = label;
      document.body.appendChild(span);
      node = {refCount: 0, element: span};
      nodes.set(label, node);
    } else {
      setId(node.element.id);
    }

    node.refCount++;
    return () => {
      if (--node.refCount === 0) {
        node.element.remove();
        nodes.delete(label);
      }
    };
  }, [label]);

  return label ? id : undefined;
}
