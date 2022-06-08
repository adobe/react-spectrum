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
import {HTMLAttributes, MutableRefObject, useCallback, useEffect, useState} from 'react';
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
  lastFocused?: HTMLElement,
  focus: () => void,
  blur: () => void
};

class LandmarkManager {
  private landmarks: Array<Landmark> = [];
  private static instance: LandmarkManager;
  private isListening = false;

  private constructor() {
    this.f6Handler = this.f6Handler.bind(this);
    this.focusinHandler = this.focusinHandler.bind(this);
    this.focusoutHandler = this.focusoutHandler.bind(this);
  }

  public static getInstance(): LandmarkManager {
    if (!LandmarkManager.instance) {
      LandmarkManager.instance = new LandmarkManager();
    }

    return LandmarkManager.instance;
  }

  private setup() {
    document.addEventListener('keydown', this.f6Handler, {capture: true});
    document.addEventListener('focusin', this.focusinHandler, {capture: true});
    document.addEventListener('focusout', this.focusoutHandler, {capture: true});
    this.isListening = true;
  }

  private teardown() {
    document.removeEventListener('keydown', this.f6Handler, {capture: true});
    document.removeEventListener('focusin', this.focusinHandler, {capture: true});
    document.removeEventListener('focusout', this.focusoutHandler, {capture: true});
    this.isListening = false;
  }

  private focusLandmark(landmark: HTMLElement) {
    this.landmarks.find(l => l.ref.current === landmark)?.focus();
  }

  /**
   * Return set of landmarks with a specific role.
   */
  public getLandmarksByRole(role: AriaLandmarkRole) {
    return new Set(this.landmarks.filter(l => l.role === role));
  }

  /**
   * Return first landmark with a specific role.
   */
  public getLandmarkByRole(role: AriaLandmarkRole) {
    return this.landmarks.find(l => l.role === role);
  }

  public addLandmark(newLandmark: Landmark) {
    if (!this.isListening) {
      this.setup();
    }
    if (this.landmarks.find(landmark => landmark.ref === newLandmark.ref)) {
      return;
    }

    if (this.landmarks.filter(landmark => landmark.role === 'main').length > 1) {
      console.error('Page can contain no more than one landmark with the role "main".');
    }

    if (this.landmarks.length === 0) {
      this.landmarks = [newLandmark];
      return;
    }


    // Binary search to insert new landmark based on position in document relative to existing landmarks.
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    let start = 0;
    let end = this.landmarks.length - 1;
    while (start <= end) {
      let mid = Math.floor((start + end) / 2);
      let comparedPosition = newLandmark.ref.current.compareDocumentPosition(this.landmarks[mid].ref.current as Node);
      let isNewAfterExisting = Boolean((comparedPosition & Node.DOCUMENT_POSITION_PRECEDING) || (comparedPosition & Node.DOCUMENT_POSITION_CONTAINS));

      if (isNewAfterExisting) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    this.landmarks.splice(start, 0, newLandmark);
  }

  public updateLandmark(landmark: Pick<Landmark, 'ref'> & Partial<Landmark>) {
    let index = this.landmarks.findIndex(l => l.ref === landmark.ref);
    if (index >= 0) {
      this.landmarks[index] = {...this.landmarks[index], ...landmark};
      this.checkLabels(this.landmarks[index].role);
    }
  }

  public removeLandmark(ref: MutableRefObject<HTMLElement>) {
    this.landmarks = this.landmarks.filter(landmark => landmark.ref !== ref);
    if (this.landmarks.length === 0) {
      this.teardown();
    }
  }

  /**
   * Warn if there are 2+ landmarks with the same role but no label.
   * Labels for landmarks with the same role must also be unique.
   *
   * See https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/.
   */
  private checkLabels(role: AriaLandmarkRole) {
    let landmarksWithRole = this.getLandmarksByRole(role);
    if (landmarksWithRole.size > 1) {
      let duplicatesWithoutLabel = [...landmarksWithRole].filter(landmark => !landmark.label);
      if (duplicatesWithoutLabel.length > 0) {
        console.warn(
          `Page contains more than one landmark with the '${role}' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute: `,
          duplicatesWithoutLabel.map(landmark => landmark.ref.current)
        );
      } else {
        let labels = [...landmarksWithRole].map(landmark => landmark.label);
        let duplicateLabels = labels.filter((item, index) => labels.indexOf(item) !== index);

        duplicateLabels.forEach((label) => {
          console.warn(
            `Page contains more than one landmark with the '${role}' role and '${label}' label. If two or more landmarks on a page share the same role, they must have unique labels: `,
            [...landmarksWithRole].filter(landmark => landmark.label === label).map(landmark => landmark.ref.current)
          );
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
   * If not, focus the landmark itself.
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

      // If alt key pressed, focus main landmark
      if (e.altKey) {
        let main = this.getLandmarkByRole('main');
        if (main && document.contains(main.ref.current)) {
          this.focusLandmark(main.ref.current);
        }
        return;
      }

      // If something was previously focused in the next landmark, then return focus to it
      if (nextLandmark.lastFocused) {
        let lastFocused = nextLandmark.lastFocused;
        if (document.body.contains(lastFocused)) {
          lastFocused.focus();
          return;
        }
      }

      // Otherwise, focus the landmark itself
      if (document.contains(nextLandmark.ref.current)) {
        this.focusLandmark(nextLandmark.ref.current);
      }
    }
  }

  /**
   * Sets lastFocused for a landmark, if focus is moved within that landmark.
   * Lets the last focused landmark know it was blurred if something else is focused.
   */
  public focusinHandler(e: FocusEvent) {
    let currentLandmark = this.closestLandmark(e.target as HTMLElement);
    if (currentLandmark && currentLandmark.ref.current !== e.target) {
      this.updateLandmark({ref: currentLandmark.ref, lastFocused: e.target as HTMLElement});
    }
    let previousFocusedElement = e.relatedTarget as HTMLElement;
    if (previousFocusedElement) {
      let closestPreviousLandmark = this.closestLandmark(previousFocusedElement);
      if (closestPreviousLandmark && closestPreviousLandmark.ref.current === previousFocusedElement) {
        closestPreviousLandmark.blur();
      }
    }
  }

  /**
   * Track if the focus is lost to the body. If it is, do cleanup on the landmark that last had focus.
   */
  public focusoutHandler(e: FocusEvent) {
    let previousFocusedElement = e.target as HTMLElement;
    let nextFocusedElement = e.relatedTarget;
    // the === document seems to be a jest thing for focus to go there on generic blur event such as landmark.blur();
    // browsers appear to send focus instead to document.body and the relatedTarget is null when that happens
    if (!nextFocusedElement || nextFocusedElement === document) {
      let closestPreviousLandmark = this.closestLandmark(previousFocusedElement);
      if (closestPreviousLandmark && closestPreviousLandmark.ref.current === previousFocusedElement) {
        closestPreviousLandmark.blur();
      }
    }
  }
}

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
  let [isLandmarkFocused, setIsLandmarkFocused] = useState(false);

  let focus = useCallback(() => {
    setIsLandmarkFocused(true);
  }, [setIsLandmarkFocused]);

  let blur = useCallback(() => {
    setIsLandmarkFocused(false);
  }, [setIsLandmarkFocused]);

  useLayoutEffect(() => {
    manager.addLandmark({ref, role, label, focus, blur});

    return () => {
      manager.removeLandmark(ref);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    manager.updateLandmark({ref, label, role, focus, blur});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, ref, role]);

  useEffect(() => {
    if (isLandmarkFocused) {
      ref.current.focus();
    }
  }, [isLandmarkFocused, ref]);

  return {
    landmarkProps: {
      role,
      tabIndex: isLandmarkFocused ? -1 : undefined
    }
  };
}
