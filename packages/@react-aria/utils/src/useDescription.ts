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
import {useCallback, useMemo, useRef, useState} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

let descriptionId = 0;
const descriptionNodes = new Map<string, {refCount: number, element: Element}>();

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

let dynamicDescriptionIdCounter = 0;
const dynamicDescriptionNodes = new Map<string, { refCount: number, element: HTMLDivElement, id: string }>();

interface DynamicDescriptionResult {
  updateDescription: (text: string | null | undefined) => void,
  descriptionProps: AriaLabelingProps
}

export function useDynamicDescription(): DynamicDescriptionResult {
  let [id, setId] = useState<string | undefined>(undefined);
  let currentTextRef = useRef<string | null>(null);
  let instanceManagedElementRef = useRef<HTMLDivElement | null>(null);
  let instanceManagedIdRef = useRef<string | null>(null);

  let updateDescription = useCallback((text: string | null | undefined) => {
    let newText = (text == null || text.trim() === '') ? null : text;
    let oldText = currentTextRef.current;

    if (oldText === newText) {
      return;
    }

    let canReclaimOldElement = false;
    if (oldText != null) {
      let oldTextInfo = dynamicDescriptionNodes.get(oldText);
      if (oldTextInfo) {
        oldTextInfo.refCount--;
        if (oldTextInfo.refCount === 0) {
          if (instanceManagedElementRef.current === oldTextInfo.element) {
            // This instance's managed element was for oldText, and no one else uses oldText.
            // Reclaim element for newText.
            canReclaimOldElement = true;
          } else {
            // oldText's refCount is 0, but it wasn't this instance's managed element
            // Remove it as it's now unused.
            oldTextInfo.element.remove();
            dynamicDescriptionNodes.delete(oldText);
          }
        }
      }
    }

    if (newText == null) {
      setId(undefined);
      if (canReclaimOldElement && instanceManagedElementRef.current) {
        // oldText's element was managed by this instance and is now free. Remove it.
        instanceManagedElementRef.current.remove();
        dynamicDescriptionNodes.delete(oldText!);
        instanceManagedElementRef.current = null;
        instanceManagedIdRef.current = null;
      }
    } else {
      let existingEntryForNewText = dynamicDescriptionNodes.get(newText);
      if (existingEntryForNewText) {
        // newText is already managed by someone. Use that.
        existingEntryForNewText.refCount++;
        setId(existingEntryForNewText.id);

        // If this instance had a reclaimable element for oldText, it's no longer needed. Clean it up.
        if (canReclaimOldElement && instanceManagedElementRef.current) {
          instanceManagedElementRef.current.remove();
          dynamicDescriptionNodes.delete(oldText!);
          instanceManagedElementRef.current = null;
          instanceManagedIdRef.current = null;
        }
      } else {
        // newText is not in dynamicDescriptionNodes. This instance will manage it.
        if (canReclaimOldElement && instanceManagedElementRef.current && instanceManagedIdRef.current) {
          // Reuse this instance's element.
          if (oldText != null) { // oldText should have been deleted from dynamicDescriptionNodes if canReclaimOldElement
            dynamicDescriptionNodes.delete(oldText);
          }
          instanceManagedElementRef.current.textContent = newText;
          dynamicDescriptionNodes.set(newText, {refCount: 1, element: instanceManagedElementRef.current, id: instanceManagedIdRef.current});
          setId(instanceManagedIdRef.current);
        } else {
          // Create a new element for newText.
          // This also handles the case where instanceManagedElementRef existed but was not reclaimable
          // (e.g., it's still in use for oldText by others).
          let newGeneratedId = `react-aria-dynamic-description-${dynamicDescriptionIdCounter++}`;
          let newNode = document.createElement('div');
          newNode.id = newGeneratedId;
          newNode.style.display = 'none';
          newNode.textContent = newText;
          document.body.appendChild(newNode);

          // If this instance *was* managing an element that couldn't be reclaimed,
          // and we are creating a new one, the old instanceManagedElementRef is now abandoned by this instance.
          // Its cleanup is handled by its own text's refCount (if it was in textMap).
          // This new node becomes the instance's managed node.
          instanceManagedElementRef.current = newNode;
          instanceManagedIdRef.current = newGeneratedId;
          dynamicDescriptionNodes.set(newText, {refCount: 1, element: newNode, id: newGeneratedId});
          setId(newGeneratedId);
        }
      }
    }
    currentTextRef.current = newText;
  }, []);

  useLayoutEffect(() => {
    return () => {
      const textToCleanOnUnmount = currentTextRef.current;

      if (textToCleanOnUnmount != null) {
        let nodeInfo = dynamicDescriptionNodes.get(textToCleanOnUnmount);
        if (nodeInfo) {
          nodeInfo.refCount--;
          if (nodeInfo.refCount === 0) {
            nodeInfo.element.remove();
            dynamicDescriptionNodes.delete(textToCleanOnUnmount);
            // If the removed element was this instance's managed one, clear the refs (optional, as instance is gone)
            if (instanceManagedElementRef.current === nodeInfo.element) {
              instanceManagedElementRef.current = null;
              instanceManagedIdRef.current = null;
            }
          }
        }
      }
    };
  }, []);

  let descriptionProps: AriaLabelingProps = useMemo(() => ({
    'aria-describedby': id
  }), [id]);

  return {updateDescription, descriptionProps};
}
