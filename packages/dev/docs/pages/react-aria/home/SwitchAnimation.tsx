/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {animationQueue, useIntersectionObserver} from './utils';
import {Finger} from './components';
import {flushSync} from 'react-dom';
import React, {useCallback, useRef, useState} from 'react';
import {Switch} from 'react-aria-components';

export function SwitchAnimation() {
  let ref = useRef(null);
  let [isAnimating, setAnimating] = useState(false);
  let [isSelected, setSelected] = useState(true);

  useIntersectionObserver(ref, useCallback(() => {
    let job = {
      isCanceled: false,
      async run() {
        flushSync(() => {
          setAnimating(true);
        });
        let animation = document.getAnimations()
          .find(anim => anim instanceof CSSAnimation && anim.animationName === 'touch-animation');
        try {
          await animation?.finished;
        } catch {
          // ignore abort errors.
        }
        setAnimating(false);
      }
    };

    animationQueue.next(job);

    return () => {
      job.isCanceled = true;
      setAnimating(false);
      setSelected(true);
    };
  }, []));

  return (
    <>
      <Finger style={{animation: isAnimating ? 'touch-animation 12s ease-in-out 500ms' : undefined}} />
      <Switch
        aria-label="Example switch"
        ref={ref}
        isSelected={isSelected}
        onChange={isAnimating ? undefined : setSelected}
        className="group inline-flex touch-none">
        <span className="[--bg:var(--color-slate-300)] dark:[--bg:var(--color-zinc-600)] forced-colors:[--bg:ButtonFace]! bg-(--bg) [--bg-selected:var(--color-green-500)] forced-colors:[--bg-selected:Highlight]! group-selected:bg-(--bg-selected) group-focus-visible:outline-2 outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight] outline-offset-2 mr-4 h-10 w-16 rounded-full border border-black/[5%] dark:border-white/10 p-[3px] transition duration-200" style={{animation: isAnimating ? 'switch-background-animation 12s ease-in-out 500ms' : undefined}}>
          <span className="group-selected:ml-6 group-selected:group-pressed:ml-4 group-pressed:w-10 block h-8 w-8 origin-right rounded-full bg-white forced-colors:bg-[ButtonText] forced-colors:group-selected:bg-[HighlightText] border border-transparent shadow-sm transition-all duration-200" style={{animation: isAnimating ? 'switch-animation 12s ease-in-out 500ms' : undefined, contain: 'layout'}} />
        </span>
      </Switch>
    </>
  );
}
