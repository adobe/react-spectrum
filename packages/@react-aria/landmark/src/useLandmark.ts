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

import {AriaLabelingProps, FocusableRef} from '@react-types/shared';
import {HTMLAttributes, useCallback} from 'react';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import {isElementVisible} from '@react-aria/focus/src/isElementVisible';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {useFocusWithin} from '@react-aria/interactions';

export interface AriaLandmarkProps  extends AriaLabelingProps {
  role: 'main' | 'region' | 'search' | 'navigation' | 'form' | 'banner' | 'contentinfo' | 'complementary'
}

interface AriaLandmarkOptions extends AriaLandmarkProps {
}

interface LandmarkAria {
  landmarkProps: HTMLAttributes<HTMLElement>
}

let landmarkRoles = ['main', 'region', 'search', 'navigation', 'form', 'banner', 'contentinfo', 'complementary'];
const LANDMARK_ELEMENT_SELECTOR = landmarkRoles.map(value => `[role=${value}]`).join(',');

function getLandmarkTreeWalker(root: HTMLElement, opts?) {
  let selector = LANDMARK_ELEMENT_SELECTOR;
  let walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        // Not sure we need this, can landmarks be nested?
        // Skip nodes inside the starting node.
        // if (opts?.from?.contains(node)) {
        //   return NodeFilter.FILTER_REJECT;
        // }

        if ((node as HTMLElement).matches(selector)
          && isElementVisible(node as HTMLElement)
          && opts?.registeredLandmarks.includes(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  if (opts?.from) {
    walker.currentNode = opts.from;
  }

  return walker;
}

function treeDistance(child: HTMLElement, target: HTMLElement): number {
  let distance = 0;
  let node = child;
  while (target && node.parentElement && node !== target) {
    node = node.parentElement;
    distance++;
  }
  return distance;
}

class LandmarkManager {
  private landmarks = new Map<FocusableRef, HTMLElement>();
  private static instance: LandmarkManager;

  private constructor() {}

  public static getInstance(): LandmarkManager {
    if (!LandmarkManager.instance) {
      LandmarkManager.instance = new LandmarkManager();
    }

    return LandmarkManager.instance;
  }

  public addLandmark(ref: FocusableRef) {
    // could change to a map to track roles, then we could warn if someone provides two of the same role but no labels for them
    if (!this.landmarks.has(ref)) {
      this.landmarks.set(ref, null);
    }
  }

  public removeLandmark(ref: FocusableRef) {
    if (this.landmarks.has(ref)) {
      this.landmarks.delete(ref);
    }
  }

  // Gets the landmark that is the closest parent in the DOM to the child
  // Useful for nested Landmarks
  private closestLandmark(child: HTMLElement) {
    return Array.from(this.landmarks.keys())
      .filter(landmark => (landmark?.current as HTMLElement).contains(child))
      .sort((landmarkA, landmarkB) =>
        treeDistance(child, landmarkA?.current) - treeDistance(child, landmarkB?.current)
      )[0];
  }

  public getNextLandmark(walker, backward) {
    let nextLandmark;
    if (backward) {
      nextLandmark = walker.previousNode();
      if (!nextLandmark) {
        walker.currentNode = document.body;
        // in nested cases, this won't return any of the nested, so traverse down the tree until there is not longer a lastChild
        nextLandmark = walker.lastChild();
        let temp = nextLandmark;
        while (temp) {
          nextLandmark = temp;
          walker.currentNode = temp;
          temp = walker.lastChild();
        }
      }
    } else {
      nextLandmark = walker.nextNode();
      if (!nextLandmark) {
        walker.currentNode = document.body;
        nextLandmark = walker.firstChild();
      }
    }
    return nextLandmark;
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

      let currentLandmark = this.closestLandmark(e.target as HTMLElement)?.current;
      let walker = getLandmarkTreeWalker(
        document.body,
        {
          from: currentLandmark || document.body,
          registeredLandmarks: Array.from(this.landmarks.keys()).map(ref => ref.current)
        }
      );
      let nextLandmark = this.getNextLandmark(walker, e.shiftKey);

      console.log('the next landmark is', nextLandmark?.getAttribute('role'));
      if (nextLandmark) {
        // if something was previously focused in this landmark, then return focus to it
        let key = Array.from(this.landmarks.keys()).find(ref => ref.current === nextLandmark);
        if (key && this.landmarks.get(key)) {
          let lastFocused = this.landmarks.get(key);
          if (document.body.contains(lastFocused)) {
            lastFocused.focus();
            return;
          }
        }
        // otherwise find an element to focus
        let focusableWalker = getFocusableTreeWalker(nextLandmark);
        let nextElement;
        if (e.shiftKey) {
          nextElement = focusableWalker.previousNode();
          if (!nextElement) {
            walker.currentNode = nextLandmark;
            nextElement = focusableWalker.lastChild();
            while (this.closestLandmark(nextElement)?.current !== nextLandmark) {
              nextElement = focusableWalker.previousNode();
            }
          }
        } else {
          nextElement = focusableWalker.nextNode();
          // remove this or to get back to a mostly working state
          if (!nextElement || (currentLandmark && !currentLandmark.contains(nextElement))) {
            walker.currentNode = nextLandmark;
            nextElement = focusableWalker.firstChild();
            while (this.closestLandmark(nextElement)?.current !== nextLandmark) {
              nextElement = focusableWalker.nextNode();
            }
          }
        }
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  }

  // Only the closest landmark cares about focus inside of it
  public focusinHandler(e: FocusEvent) {
    let currentLandmark = this.closestLandmark(e.target);
    this.landmarks.set(currentLandmark, e.target);
  }
}

document.addEventListener('keydown', LandmarkManager.getInstance().f6Handler.bind(LandmarkManager.getInstance()), {capture: true});
document.addEventListener('focusin', LandmarkManager.getInstance().focusinHandler.bind(LandmarkManager.getInstance()), {capture: true});


/**
 * TODO: Add description of aria hook here.
 * @param props - Props for the LandmarkManager.
 * @param state - State for the LandmarkManager.
 */
export function useLandmark(props: AriaLandmarkOptions, ref: FocusableRef): LandmarkAria {
  let manager = LandmarkManager.getInstance();
  useLayoutEffect(() => {
    manager.addLandmark(ref);
    return () => {
      manager.removeLandmark(ref);
    };
  }, []);

  return {landmarkProps: props};
}
