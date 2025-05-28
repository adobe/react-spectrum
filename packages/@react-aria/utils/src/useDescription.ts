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

interface DynamicDescriptionResult {
  updateDescription: (text: string) => void,
  descriptionProps: AriaLabelingProps
}

export function useDynamicDescription(): DynamicDescriptionResult {
  let [id] = useState(() => `react-aria-dynamic-description-${dynamicDescriptionIdCounter++}`);
  let [currentText, setCurrentText] = useState<string | undefined>(undefined);
  let elementRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let node = document.createElement('div');
    node.id = id;
    node.style.display = 'none';
    document.body.appendChild(node);
    elementRef.current = node;

    return () => {
      if (elementRef.current) {
        elementRef.current.remove();
        elementRef.current = null;
      }
    };
  }, [id]);

  let updateDescription = useCallback((text: string) => {
    setCurrentText(text);
    if (elementRef.current) {
      elementRef.current.textContent = text;
    }
  }, []);

  let descriptionProps: AriaLabelingProps = useMemo(() => ({
    'aria-describedby': (currentText != null && currentText !== '') ? id : undefined
  }), [currentText, id]);

  return {updateDescription, descriptionProps};
}
