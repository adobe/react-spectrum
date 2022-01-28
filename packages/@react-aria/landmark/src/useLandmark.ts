/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {getFocusableTreeWalker} from '@react-aria/focus';
import {HTMLAttributes, MutableRefObject} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

export interface AriaLandmarkProps  extends AriaLabelingProps {
  role: 'main' | 'region' | 'search' | 'navigation' | 'form' | 'banner' | 'contentinfo' | 'complementary'
}

interface LandmarkAria {
  landmarkProps: HTMLAttributes<HTMLElement>
}

type Landmark = {
  ref: MutableRefObject<HTMLElement>,
  role: string,
  label?: string,
  lastFocused?: HTMLElement
};

class LandmarkManager {
  private landmarks: Array<Landmark> = [];
  private static instance: LandmarkManager;

  private constructor() {}

  public static getInstance(): LandmarkManager {
    if (!LandmarkManager.instance) {
      LandmarkManager.instance = new LandmarkManager();
    }

    return LandmarkManager.instance;
  }

  // Get list of landmarks with a specific role.
  public getLandmarksByRole(role) {
    return new Set(this.landmarks.filter(l => l.role === role));
  }

  public addLandmark({ref, role, label}: Landmark) {
    if (!this.landmarks.find(landmark => landmark.ref === ref)) {

       // TODO: Nested case?
       // Inside should be after (DFS). So maybe we need to accept 4 or 8?
      let insertPosition = 0;
      // p1.compareDocumentPosition(p2) returns 4 for when p1 is positioned before p2.
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
      while (
        insertPosition < this.landmarks.length &&
        (ref.current.compareDocumentPosition(this.landmarks[insertPosition].ref.current as Node) & Node.DOCUMENT_POSITION_PRECEDING)
        ) {
        insertPosition++;
      }
      this.landmarks.splice(insertPosition, 0, {ref, role, label});
    }
  }

  public removeLandmark(ref: MutableRefObject<HTMLElement>) {
    this.landmarks = this.landmarks.filter(landmark => landmark.ref !== ref);
  }

  // Gets the landmark that is the closest parent in the DOM to the child
  // Useful for nested Landmarks
  private closestLandmark(element: HTMLElement) {
    let landmarkMap = new Map(this.landmarks.map(l => [l.ref.current, l]));
    let currentElement = element;
    while (!landmarkMap.has(currentElement) && currentElement !== document.body) {
      currentElement = currentElement.parentElement;
    }
    return landmarkMap.get(currentElement);
  }

  public getNextLandmark(element: HTMLElement, {backward}: {backward?: boolean }) {
    let currentLandmark = this.closestLandmark(element);
    let nextLandmarkIndex = 0;
    if (currentLandmark) {
      nextLandmarkIndex = this.landmarks.findIndex(landmark => landmark === currentLandmark) + (backward ? -1 : 1);
    }

    // Wrap if necessary
    if (nextLandmarkIndex < 0) {
      nextLandmarkIndex = this.landmarks.length - 1;
    } else if (nextLandmarkIndex >= this.landmarks.length) {
      nextLandmarkIndex = 0;
    }

    return this.landmarks[nextLandmarkIndex];
  }

  // skipping nodes in the current landmark, look for the next landmark, wrap if needed
  // if that landmark had something focused in it previously, focus that
  // else focus the first focusable element
  // hopefully getFocusableTreeWalker will do the searching, or some derivative of it
  // can we use FocusScope to handle the refocusing inside the landmark?
  // essentially treat landmarks as a focus scope but without wrapping or restore or containment
  public f6Handler(e: KeyboardEvent) {
    if (e.key === 'F6') {
      e.preventDefault();
      e.stopPropagation();

      let nextLandmark = this.getNextLandmark(e.target as HTMLElement, {backward: e.shiftKey});
      
      // If something was previously focused in the next landmark, then return focus to it
      if (nextLandmark.lastFocused) {
        let lastFocused = nextLandmark.lastFocused;
        if (document.body.contains(lastFocused)) {
          lastFocused.focus();
          return;
        }
      }

      // Otherwise, focus the first focusable element in the next landmark
      let walker = getFocusableTreeWalker(nextLandmark.ref.current, {tabbable: true});
      let nextNode = walker.nextNode() as HTMLElement;
      if (!nextNode) {
        nextNode = walker.firstChild() as HTMLElement;
      }
      nextNode.focus();
    }
  }

  // Only the closest landmark cares about focus inside of it
  public focusinHandler(e: FocusEvent) {
    let currentLandmark = this.closestLandmark(e.target as HTMLElement);
    this.landmarks = this.landmarks.map((landmark) => ({...landmark, ...(landmark === currentLandmark && {lastFocused: e.target as HTMLElement})}));
  }
}

document.addEventListener('keydown', LandmarkManager.getInstance().f6Handler.bind(LandmarkManager.getInstance()), {capture: true});
document.addEventListener('focusin', LandmarkManager.getInstance().focusinHandler.bind(LandmarkManager.getInstance()), {capture: true});

/**
 * Provides landmark navigation in an application. Call this with a role and label to register a landmark navigable with F6.
 * @param props - Props for the landmark.
 * @param ref - Ref to the landmark.
 */
export function useLandmark(props: AriaLandmarkProps, ref: MutableRefObject<HTMLElement>): LandmarkAria {
  const {
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;
  let manager = LandmarkManager.getInstance();
  let label = ariaLabel || ariaLabelledby;

  useLayoutEffect(() => {
    manager.addLandmark({ref, role, label});

    // Warn if there are 2+ landmarks with the same role but no label.
    // Labels for landmarks with the same role must also be unique.
    // https://www.w3.org/TR/wai-aria-practices/examples/landmarks/navigation.html
    // TODO: Handle duplicate labels more precisely.
    let landmarksWithRole = manager.getLandmarksByRole(role);
    if (landmarksWithRole.size > 1) {
      if ([...landmarksWithRole].some(landmark => !landmark.label)) {
        console.warn(`Page contains more than one landmark with the '${role}' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute.`);
      } else if ([...landmarksWithRole].filter(landmark => landmark.label === label).length > 1) {
        console.log([...landmarksWithRole]);
        console.warn(`Page contains more than one landmark with the '${role}' role and ${label} label. If two or more landmarks on a page share the same role, they must have unique labels.`);
      }
    }

    return () => {
      manager.removeLandmark(ref);
    };
  }, []);

  // let everything through? or only return role + labelling?
  return {landmarkProps: props};
}
