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

import {AriaLabelingProps} from '@react-types/shared';
import {useLayoutEffect} from './useLayoutEffect';
import {useRef, useState} from 'react';

let descriptionId = 0;

interface DescriptionNode {
  refCount: number,
  element: HTMLElement
}

interface DescriptionSubscription {
  key: string,
  node: DescriptionNode,
  nodes: Map<string, DescriptionNode>
}

const descriptionNodes = new Map<string, DescriptionNode>();
const dynamicDescriptionNodes = new Map<string, DescriptionNode>();

function createDescriptionNode(id: string, description: string): HTMLElement {
  let node = document.createElement('div');
  node.id = id;
  node.style.display = 'none';
  node.textContent = description;
  document.body.appendChild(node);
  return node;
}

function getOrCreateDescriptionNode(nodes: Map<string, DescriptionNode>, descriptionKey: string, description: string) {
  let desc = nodes.get(descriptionKey);
  if (!desc) {
    let id = `react-aria-description-${descriptionId++}`;
    let node = createDescriptionNode(id, description);
    desc = {refCount: 0, element: node};
    nodes.set(descriptionKey, desc);
  }

  return desc;
}

function cleanupDescriptionSubscription(subscription: DescriptionSubscription, nodeRef: {current: HTMLElement | null}) {
  if (--subscription.node.refCount === 0) {
    subscription.node.element.remove();
    subscription.nodes.delete(subscription.key);
  }

  if (nodeRef.current === subscription.node.element) {
    nodeRef.current = null;
  }
}

/**
 * Provides an `aria-describedby` reference to a shared hidden description node.
 * By default, descriptions are shared by exact text. If `descriptionKey` is provided,
 * a stable node is shared by key and its text content updates in place as the
 * description changes.
 */
export function useDescription(description?: string, descriptionKey?: string): AriaLabelingProps {
  let [id, setId] = useState<string | undefined>();
  let subscriptionRef = useRef<DescriptionSubscription | null>(null);
  let nodeRef = useRef<HTMLElement | null>(null);
  let isDynamic = descriptionKey != null;

  useLayoutEffect(() => {
    let subscription = subscriptionRef.current;
    let key = descriptionKey ?? description;
    let nodes = isDynamic ? dynamicDescriptionNodes : descriptionNodes;
    if (subscription && (subscription.key !== key || subscription.nodes !== nodes)) {
      cleanupDescriptionSubscription(subscription, nodeRef);
      subscriptionRef.current = null;
      subscription = null;
    }

    if (!subscription && description && key) {
      let node = getOrCreateDescriptionNode(nodes, key, isDynamic ? '' : description);
      node.refCount++;
      subscription = {key, node, nodes};
      subscriptionRef.current = subscription;
      nodeRef.current = node.element;
      setId(node.element.id);
    }

    if (isDynamic && description && nodeRef.current) {
      nodeRef.current.textContent = description;
    }
  }, [description, descriptionKey, isDynamic]);

  useLayoutEffect(() => {
    return () => {
      let subscription = subscriptionRef.current;
      if (subscription) {
        cleanupDescriptionSubscription(subscription, nodeRef);
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    'aria-describedby': description ? id : undefined
  };
}
