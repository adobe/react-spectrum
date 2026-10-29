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

/// <reference types="vite/types/import-meta.d.ts" />
import {deadline, now} from './runtime.mjs';
import type {Environment} from './explorer.mjs';
import {explore, replay} from './explorer.mjs';
import {it} from 'vitest';

// Runs one request from `yarn verify explore|replay|check|conform` inside Vitest, which
// supplies TypeScript, the repository's module resolution, jsdom or Chromium,
// and fake timers. The request is injected by targets.config.ts.
declare const __VERIFY_REQUEST__: {
  target: string;
  mode: 'explore' | 'replay' | 'check' | 'conform';
  environment: 'jsdom' | 'chromium';
  output: string;
  timeoutMs: number;
  options?: {depth?: number; maxRuns?: number};
  trace?: any;
  // A batch of traces to replay, from `check`.
  traces?: any[];
  headed?: boolean;
};

declare module 'vitest/browser' {
  interface BrowserCommands {
    verifyConformance: (metadata: any, paths: any[], timeoutMs: number) => Promise<any>;
    writeVerifyResult: (result: object) => Promise<void>;
    verifyTouch: (selector: string, type: 'start' | 'cancel') => Promise<void>;
    verifyStep: (name: string, index: number, action: string | null) => Promise<void>;
  }
}

const request = __VERIFY_REQUEST__;
const targets = import.meta.glob<{default: any}>('./*/target.tsx');

async function createEnvironment(): Promise<Environment> {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  if (request.environment === 'chromium') {
    // Playwright input: trusted events, real hit testing and boundary events.
    let {commands, userEvent} = await import('vitest/browser');
    // On a cold start the test iframe can still be laid out when the run begins, and the
    // first Playwright moves miss the page entirely. Wait until a hover lands, in a corner
    // that target content is unlikely to cover; targets then position the pointer themselves.
    let probe = document.createElement('div');
    probe.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 20px; height: 20px';
    document.body.append(probe);
    try {
      for (let attempt = 0; !probe.matches(':hover'); attempt++) {
        if (attempt === 20) throw new Error('Playwright input never reached the page.');
        await new Promise(resolve => requestAnimationFrame(resolve));
        await userEvent.hover(probe);
      }
    } finally {
      probe.remove();
    }
    return {
      name: 'chromium',
      input: {
        hover: element => userEvent.hover(element),
        // A CDP touch, so the browser itself generates the pointer events.
        async touch(element, type) {
          const expected = type === 'start' ? 'pointerdown' : 'pointercancel';
          let received: PointerEvent | null = null;
          let listener = (event: PointerEvent) => {
            if (event.isTrusted && event.pointerType === 'touch') received = event;
          };
          document.addEventListener(expected, listener, true);
          element.setAttribute('data-verify-touch', '');
          try {
            await commands.verifyTouch('[data-verify-touch]', type);
          } finally {
            element.removeAttribute('data-verify-touch');
            document.removeEventListener(expected, listener, true);
          }
          if (!received) throw new Error(`Input not registered: no trusted ${expected}.`);
          return (received as PointerEvent).pointerId;
        }
      }
    };
  }
  let {definePointerEvent} = await import('../packages/@react-aria/test-utils/src/testSetup');
  let {pointerMap} = await import('../packages/@react-aria/test-utils/src/userEventMaps');
  let {default: userEvent} = await import('@testing-library/user-event');
  definePointerEvent();
  // jsdom has no CSS.escape; react-aria uses it for meta tag selectors.
  (globalThis as any).CSS ??= {};
  CSS.escape ??= value => value.replace(/[^\w-]/g, char => `\\${char}`);
  let user = userEvent.setup({delay: null, pointerMap});
  return {
    name: 'jsdom',
    input: {
      hover: element => user.hover(element),
      async touch(element, type) {
        let pointerId = 2;
        element.dispatchEvent(
          new PointerEvent(type === 'start' ? 'pointerdown' : 'pointercancel', {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId,
            pointerType: 'touch',
            button: 0,
            buttons: type === 'start' ? 1 : 0,
            width: 10,
            height: 10,
            isPrimary: false
          })
        );
        return pointerId;
      }
    }
  };
}

// In Chromium, a screenshot after each step of a replay, in <Invariant>.steps.
async function stepRecorder(name: string) {
  if (request.environment !== 'chromium') return undefined;
  let {commands} = await import('vitest/browser');
  return (index: number, action: string | null) => commands.verifyStep(name, index, action);
}

async function replayTraces(target: any, env: Environment, options: object) {
  let replays: any[] = [];
  for (let trace of request.traces!) {
    try {
      replays.push(
        await replay(target, env, trace, {...options, onStep: await stepRecorder(trace.invariant)})
      );
    } catch (failure) {
      if (failure instanceof Error && failure.name === 'TimeoutError') throw failure;
      replays.push({status: 'error', error: failure instanceof Error ? failure.message : failure});
    }
  }
  return {
    schemaVersion: 1,
    target: target.name,
    environment: env.name,
    status: 'replayed',
    replays
  };
}

async function writeResult(result: object) {
  if (request.environment === 'chromium') {
    let {commands} = await import('vitest/browser');
    await commands.writeVerifyResult(result);
  } else {
    let {writeFileSync} = await import('node:fs');
    writeFileSync(request.output, JSON.stringify(result, null, 2) + '\n');
  }
}

it(`${request.mode} ${request.target} (${request.environment})`, async () => {
  let started = now();
  let checkDeadline = deadline(request.timeoutMs);
  let options = {...request.options, checkDeadline};
  let consoleErrors: string[] = [];
  let error = console.error;
  console.error = (...args) => {
    if (consoleErrors.length < 20) consoleErrors.push(args.map(String).join(' '));
  };
  try {
    let load = targets[`./${request.target}/target.tsx`];
    if (!load) throw new Error(`Unknown target: ${request.target}`);
    let target = (await load()).default;
    let result;
    if (request.mode === 'conform' && request.environment === 'chromium') {
      if (!target.model) throw new Error(`${request.target} has no model.`);
      let env = await createEnvironment();
      let exploration: any = await explore(target, env, {
        ...options,
        invariants: false,
        collect: true
      });
      if (exploration.status === 'passed') {
        let {commands} = await import('vitest/browser');
        let {project, ...model} = target.model;
        result = await commands.verifyConformance(
          {name: target.name, model},
          exploration.paths.map(path => ({...path, observations: path.observations.map(project)})),
          Math.max(0, request.timeoutMs - (now() - started))
        );
        result.exploration = {
          runs: exploration.runs,
          distinctStates: exploration.distinctStates,
          depthReached: exploration.depthReached,
          neverEnabled: exploration.neverEnabled
        };
      } else result = exploration;
    } else if (request.mode === 'check' || request.mode === 'conform') {
      if (!target.model) throw new Error(`${request.target} has no model.`);
      // Node-only: tla-ts and the model files are never loaded in Chromium.
      let {checkModel, conformModel, loadModel} = await import('./model.mjs');
      let {fileURLToPath} = await import('node:url');
      let {dirname, join} = await import('node:path');
      let model = loadModel(
        join(dirname(fileURLToPath(import.meta.url)), request.target),
        target.model.spec
      );
      if (request.mode === 'check') {
        result = await checkModel(target, model, options);
      } else {
        let env = await createEnvironment();
        let exploration: any = await explore(target, env, {
          ...options,
          invariants: false,
          collect: true
        });
        let summary = {
          runs: exploration.runs,
          distinctStates: exploration.distinctStates,
          depthReached: exploration.depthReached,
          neverEnabled: exploration.neverEnabled
        };
        result =
          exploration.status === 'passed'
            ? {
                ...(await conformModel(target, model, exploration.paths, options)),
                exploration: summary
              }
            : {
                exploration: summary,
                status: exploration.status,
                error: exploration.error ?? 'Exploration was incomplete.'
              };
      }
    } else {
      let env = await createEnvironment();
      result =
        request.mode === 'explore'
          ? await explore(target, env, options)
          : request.traces
            ? await replayTraces(target, env, options)
            : await replay(target, env, request.trace, {
                ...options,
                onStep: await stepRecorder(request.trace?.invariant ?? 'trace')
              });
    }
    // A result that finished after the deadline is still evidence; keep it.
    await writeResult({...result, consoleErrors});
  } catch (failure) {
    await writeResult({
      schemaVersion: 1,
      target: request.target,
      environment: request.environment,
      status: failure instanceof Error && failure.name === 'TimeoutError' ? 'timed-out' : 'error',
      error: failure instanceof Error ? failure.stack || failure.message : String(failure),
      consoleErrors
    });
  } finally {
    console.error = error;
  }
}, 0);
