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
const descriptionNodes = new Map<string, {refCount: number, element: HTMLElement}>();
const dynamicDescriptionNodes = new Map<string, {refCount: number, element: HTMLElement}>();

function createDescriptionNode(id: string, description: string): HTMLElement {
  let node = document.createElement('div');
  node.id = id;
  node.style.display = 'none';
  node.textContent = description;
  document.body.appendChild(node);
  return node;
}

function getOrCreateDynamicDescriptionNode(descriptionKey: string) {
  let desc = dynamicDescriptionNodes.get(descriptionKey);
  if (!desc) {
    let id = `react-aria-description-${descriptionId++}`;
    let node = createDescriptionNode(id, '');
    desc = {refCount: 0, element: node};
    dynamicDescriptionNodes.set(descriptionKey, desc);
  }

  return desc;
}

export function useDescription(description?: string): AriaLabelingProps {
  let [id, setId] = useState<string | undefined>();

  useLayoutEffect(() => {
    if (!description) {
      return;
    }

    let desc = descriptionNodes.get(description);
    if (!desc) {
      let id = `react-aria-description-${descriptionId++}`;
      setId(id);

      let node = createDescriptionNode(id, description);
      desc = {refCount: 0, element: node};
      descriptionNodes.set(description, desc);
    } else {
      setId(desc.element.id);
    }

    desc.refCount++;
    return () => {
      if (desc && --desc.refCount === 0) {
        desc.element.remove();
        descriptionNodes.delete(description);
      }
    };
  }, [description]);

  return {
    'aria-describedby': description ? id : undefined
  };
}

/**
 * Provides a stable `aria-describedby` id for descriptions that change over time.
 * Unlike `useDescription`, this shares a hidden element by `descriptionKey`
 * and updates its text content in place so many consumers can reuse one id.
 */
export function useDynamicDescription(description: string | undefined, descriptionKey: string): AriaLabelingProps {
  let [id, setId] = useState<string | undefined>();
  let subscriptionRef = useRef<{key: string, desc: {refCount: number, element: HTMLElement}} | null>(null);
  let nodeRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    let subscription = subscriptionRef.current;
    if (subscription && subscription.key !== descriptionKey) {
      if (--subscription.desc.refCount === 0) {
        subscription.desc.element.remove();
        dynamicDescriptionNodes.delete(subscription.key);
      }

      subscriptionRef.current = null;
      if (nodeRef.current === subscription.desc.element) {
        nodeRef.current = null;
      }
      subscription = null;
    }

    if (!subscription && description) {
      let desc = getOrCreateDynamicDescriptionNode(descriptionKey);
      desc.refCount++;
      subscriptionRef.current = {key: descriptionKey, desc};
      nodeRef.current = desc.element;
      setId(desc.element.id);
      desc.element.textContent = description;
    }
  }, [descriptionKey, description]);

  useLayoutEffect(() => {
    if (description && nodeRef.current) {
      nodeRef.current.textContent = description;
    }
  }, [description]);

  useLayoutEffect(() => {
    return () => {
      let subscription = subscriptionRef.current;
      if (subscription) {
        if (--subscription.desc.refCount === 0) {
          subscription.desc.element.remove();
          dynamicDescriptionNodes.delete(subscription.key);
        }

        subscriptionRef.current = null;
        if (nodeRef.current === subscription.desc.element) {
          nodeRef.current = null;
        }
      }
    };
  }, []);

  return {
    'aria-describedby': description ? id : undefined
  };
}
