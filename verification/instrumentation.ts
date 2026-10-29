/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {Plugin} from 'vite';

// Private-state probes are injected only by the verification Vite config. Production
// modules and public exports are unchanged. A missing probe fails the run.
export function instrumentation(): Plugin {
  const probes = {
    '/tooltip/useTooltipTriggerState.ts': `({
      read: () => ({entries: Object.keys(tooltips), warmed: globalWarmedUp,
        warmup: globalWarmUpTimeout !== null, cooldown: globalCooldownTimeout !== null}),
      reset: () => { tooltips = {}; tooltipId = 0; globalWarmedUp = false;
        clearTimeout(globalWarmUpTimeout); clearTimeout(globalCooldownTimeout);
        globalWarmUpTimeout = null; globalCooldownTimeout = null; }
    })`,
    '/overlays/useOverlay.ts': '({read: () => visibleOverlays.map(ref => ref.current?.id)})',
    '/overlays/ariaHideOutside.ts':
      '({read: () => observerStack.length, count: element => refCountMap.get(element) ?? 0})',
    '/overlays/usePreventScroll.ts': '({read: () => preventScrollCount})',
    '/dnd/DragManager.ts': '({read: () => ({session: dragSession, targets: dropTargets})})'
  };
  return {
    name: 'verification-probes',
    enforce: 'pre',
    transform(code, id) {
      for (let [suffix, probe] of Object.entries(probes)) {
        if (id.endsWith(suffix)) {
          return `${code}\n;globalThis.__verification ??= {}; globalThis.__verification[${JSON.stringify(suffix)}] = ${probe};`;
        }
      }
    }
  };
}
