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
import {HTMLAttributes, MutableRefObject, useEffect} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

export type AriaLandmarkRole = 'main' | 'region' | 'search' | 'navigation' | 'form' | 'banner' | 'contentinfo' | 'complementary';

export interface AriaLandmarkProps extends AriaLabelingProps {
  role: AriaLandmarkRole
}

interface LandmarkAria {
  landmarkProps: HTMLAttributes<HTMLElement>
}

type Landmark = {
  ref: MutableRefObject<HTMLElement>,
  role: AriaLandmarkRole,
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

  /**
   * Return set of landmarks with a specific role.
   */
  public getLandmarksByRole(role: AriaLandmarkRole) {
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

  public updateLandmark(landmark: Landmark) {
    this.landmarks = this.landmarks.map((prevLandmark) => prevLandmark.ref.current === landmark.ref.current ? {...prevLandmark, ...landmark} : prevLandmark);
    this.checkLabels(landmark.role);
  }

  public removeLandmark(ref: MutableRefObject<HTMLElement>) {
    this.landmarks = this.landmarks.filter(landmark => landmark.ref !== ref);
  }

  /**
   * Warn if there are 2+ landmarks with the same role but no label.
   * Labels for landmarks with the same role must also be unique.
   * 
   * See https://www.w3.org/TR/wai-aria-practices/examples/landmarks/navigation.html.
   */
  private checkLabels(role: AriaLandmarkRole) {
    let landmarksWithRole = this.getLandmarksByRole(role);
    if (landmarksWithRole.size > 1) {
      if ([...landmarksWithRole].some(landmark => !landmark.label)) {
        console.warn(`Page contains more than one landmark with the '${role}' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute.`);
      } else {
        let labels = [...landmarksWithRole].map(landmark => landmark.label);
        let duplicateLabels = labels.filter((item, index) => labels.indexOf(item) !== index);
  
        duplicateLabels.forEach((label) => {
          console.warn(`Page contains more than one landmark with the '${role}' role and '${label}' label. If two or more landmarks on a page share the same role, they must have unique labels.`);
        });
      }
    }
  }

  /**
   * Get the landmark that is the closest parent in the DOM.
   * Returns undefined if no parent is a landmark.
   */
  private closestLandmark(element: HTMLElement) {
    let landmarkMap = new Map(this.landmarks.map(l => [l.ref.current, l]));
    let currentElement = element;
    while (!landmarkMap.has(currentElement) && currentElement !== document.body) {
      currentElement = currentElement.parentElement;
    }
    return landmarkMap.get(currentElement);
  }

  /**
   * Gets the next landmark, in DOM focus order, or previous if backwards is specified.
   * If nested, next should be the child landmark. 
   * If last landmark, next should be the first landmark.
   * If not inside a landmark, will return first landmark.
   * Returns undefined if there are no landmarks.
   */
  public getNextLandmark(element: HTMLElement, {backward}: {backward?: boolean }) {
    if (this.landmarks.length === 0) {
      return undefined;
    }
    
    let currentLandmark = this.closestLandmark(element);
    let nextLandmarkIndex = backward ? -1 : 0;
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

  /**
   * Look at next landmark. If an element was previously focused inside, restore focus there.
   * If not, focus the first focusable element inside the lanemark.
   * If no focusable elements inside, go to the next landmark.
   * If no landmarks at all, or none with focusable elements, don't move focus.
   */
  public f6Handler(e: KeyboardEvent) {
    if (e.key === 'F6') {
      e.preventDefault();
      e.stopPropagation();

      let backward = e.shiftKey;
      let nextLandmark = this.getNextLandmark(e.target as HTMLElement, {backward});

      // If no landmarks, return
      if (!nextLandmark) {
        return;
      }

      // Iterate through landmarks, starting at next landmark
      // until we reach a landmark with a focusble element.
      let initialNextLandmark = nextLandmark;
      do {
        // If something was previously focused in the next landmark, then return focus to it
        if (nextLandmark.lastFocused) {
          let lastFocused = nextLandmark.lastFocused;
          if (document.body.contains(lastFocused)) {
            lastFocused.focus();
            return;
          }
        }

        // Otherwise, focus the first focusable element in the next landmark
        let leadingSentinal = nextLandmark.ref.current.previousSibling || nextLandmark.ref.current.parentElement;
        // If we want to add a scope, this is what we're thinking:
        // let trailingSentinal = nextLandmark.ref.current.nextSibling;
        // let scope = [leadingSentinal, trailingSentinal];
        let walker = getFocusableTreeWalker(nextLandmark.ref.current, {tabbable: true});
        let nextNode = walker.nextNode() as HTMLElement;
        if (!nextNode) {
          walker.currentNode = leadingSentinal;
          nextNode = walker.nextNode() as HTMLElement;
        }
        while (nextNode && this.closestLandmark(nextNode) !== nextLandmark) {
          nextNode = walker.nextNode() as HTMLElement;
        }
        if (document.body.contains(nextNode)) {
          nextNode.focus();
          return;
        }
        
        nextLandmark = this.getNextLandmark(nextLandmark.ref.current, {backward});
      } while (nextLandmark !== initialNextLandmark);
     
    }
  }

  /**
   * Sets lastFocused for a landmark, if focus is moved within that landmark.
   */
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
    
    return () => {
      manager.removeLandmark(ref);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    manager.updateLandmark({ref, label, role});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, ref, role]);

  // let everything through? or only return role + labelling?
  return {landmarkProps: props};
}
