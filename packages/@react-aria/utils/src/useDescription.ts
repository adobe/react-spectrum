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
import {useCallback, useRef, useState} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

let descriptionId = 0;
const descriptionNodes = new Map<string, {refCount: number, element: Element}>();
const dynamicDescriptionNodes = new Map<string, {refCount: number, element: Element}>();

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

      let node = document.createElement('div');
      node.id = id;
      node.style.display = 'none';
      node.textContent = description;
      document.body.appendChild(node);
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

export type DynamicDescriptionResult = {
  /** Props for the description element. */
  descriptionProps: AriaLabelingProps,
  /** Setter for updating the description text. */
  setDescription: (description?: string) => void
}

/**
 * Similar to `useDescription`, but optimized for cases where the description text
 * changes over time (e.g. drag modality changes) and multiple consumers are on the page.
 * Instead of destroying and recreating the description element, this hook keeps the
 * same element (and id) for the lifetime of the component and updates the element's text
 * content when needed, avoiding unnecessary re-renders (e.g. many drop targets on the page).
 */
export function useDynamicDescription(initialDescription?: string): DynamicDescriptionResult {
  let [idState, setIdState] = useState<string | undefined>();

  let elementRef = useRef<Element | null>(null);
  let descRef = useRef<{refCount: number, element: Element} | null>(null);

  let getOrCreateNode = useCallback((text: string): Element => {
    let desc = dynamicDescriptionNodes.get(text);
    if (!desc) {
      let node = document.createElement('div');
      node.id = `react-aria-description-${descriptionId++}`;
      node.style.display = 'none';
      node.textContent = text;
      document.body.appendChild(node);
      desc = {refCount: 0, element: node};
      dynamicDescriptionNodes.set(text, desc);
    }

    desc.refCount++;
    descRef.current = desc;
    elementRef.current = desc.element;
    setIdState(desc.element.id);
    return desc.element;
  }, []);

  useLayoutEffect(() => {
    if (initialDescription) {
      if (!elementRef.current) {
        getOrCreateNode(initialDescription);
        return;
      }

      if (elementRef.current.textContent === initialDescription) {
        return;
      }

      for (let [key, value] of dynamicDescriptionNodes) {
        if (value.element === elementRef.current) {
          dynamicDescriptionNodes.delete(key);
          break;
        }
      }

      dynamicDescriptionNodes.set(initialDescription, descRef.current!);
      elementRef.current.textContent = initialDescription;
      return;
    }

    if (elementRef.current && descRef.current) {
      descRef.current.refCount--;
      if (descRef.current.refCount === 0) {
        descRef.current.element.remove();
        for (let [key, value] of dynamicDescriptionNodes) {
          if (value === descRef.current) {
            dynamicDescriptionNodes.delete(key);
            break;
          }
        }
      }

      elementRef.current = null;
      descRef.current = null;
      setIdState(undefined);
    }
  }, [initialDescription, getOrCreateNode]);

  useLayoutEffect(() => {
    return () => {
      if (descRef.current) {
        descRef.current.refCount--;
        if (descRef.current.refCount === 0) {
          descRef.current.element.remove();
          for (let [key, value] of dynamicDescriptionNodes) {
            if (value === descRef.current) {
              dynamicDescriptionNodes.delete(key);
              break;
            }
          }
        }
      }
    };
  }, []);

  let setDescription = useCallback((description?: string) => {
    if (description === undefined) {
      return;
    }

    if (!description) {
      if (elementRef.current && descRef.current) {
        descRef.current.refCount--;
        if (descRef.current.refCount === 0) {
          descRef.current.element.remove();
          for (let [key, value] of dynamicDescriptionNodes) {
            // eslint-disable-next-line max-depth
            if (value === descRef.current) {
              dynamicDescriptionNodes.delete(key);
              break;
            }
          }
        }
        elementRef.current = null;
        descRef.current = null;
        setIdState(undefined);
      }
      return;
    }

    if (!elementRef.current) {
      getOrCreateNode(description);
      return;
    }

    if (elementRef.current.textContent === description) {
      return;
    }

    for (let [key, value] of dynamicDescriptionNodes) {
      if (value.element === elementRef.current) {
        dynamicDescriptionNodes.delete(key);
        break;
      }
    }
    dynamicDescriptionNodes.set(description, descRef.current!);
    elementRef.current.textContent = description;
  }, [getOrCreateNode]);

  return {
    descriptionProps: {
      'aria-describedby': idState
    },
    setDescription
  };
}
