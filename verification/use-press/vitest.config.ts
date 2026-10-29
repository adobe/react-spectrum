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

import base from '../../vitest.browser.config';
import {createHash} from 'node:crypto';
import {defineConfig} from 'vitest/config';
import {mutations} from './mutations.mjs';
import {readFileSync, writeFileSync} from 'node:fs';
import {validateTrace} from './replay.mjs';

let mutationName = process.env.USE_PRESS_MUTATION;
if (mutationName && !(mutationName in mutations)) {
  throw new Error(`Unknown usePress mutation: ${mutationName}`);
}
let trace = process.env.USE_PRESS_TRACE
  ? validateTrace(JSON.parse(readFileSync(process.env.USE_PRESS_TRACE, 'utf8')))
  : null;
if (trace && mutationName && !process.env.USE_PRESS_MUTATION_RECEIPT)
  throw new Error('Replay mutation checks require a validation receipt.');

export default defineConfig({
  ...base,
  define: {...base.define, __VERIFICATION_TRACE__: JSON.stringify(trace)},
  plugins: [
    {
      name: 'use-press-verification-mutation',
      enforce: 'pre',
      transform(code, id) {
        if (!mutationName || !id.endsWith('/react-aria/src/interactions/usePress.ts')) {
          return;
        }
        let mutation = mutations[mutationName as keyof typeof mutations];
        if (code.split(mutation.before).length !== 2) {
          throw new Error(
            `Mutation ${mutationName} no longer matches exactly once; review the source.`
          );
        }
        let mutated = code.replace(mutation.before, mutation.after);
        if (process.env.USE_PRESS_MUTATION_RECEIPT) {
          let hash = (value: string) => createHash('sha256').update(value).digest('hex');
          writeFileSync(
            process.env.USE_PRESS_MUTATION_RECEIPT,
            JSON.stringify({
              schemaVersion: 1,
              mutation: mutationName,
              source: 'packages/react-aria/src/interactions/usePress.ts',
              originalHash: hash(code),
              mutatedHash: hash(mutated)
            })
          );
        }
        return {code: mutated, map: null};
      }
    },
    ...base.plugins!
  ],
  test: {
    ...base.test,
    include: [
      trace
        ? 'packages/react-aria/test/interactions/usePress.replay.browser.tsx'
        : 'packages/react-aria/test/interactions/usePress.verification.browser.tsx'
    ],
    browser: {
      ...base.test?.browser,
      screenshotFailures: false,
      commands: {
        ...base.test?.browser?.commands,
        writePressReplay: async (_context, result) => {
          if (!trace || !process.env.USE_PRESS_REPLAY_RESULT)
            throw new Error('Replay output was not configured.');
          writeFileSync(process.env.USE_PRESS_REPLAY_RESULT, JSON.stringify(result, null, 2));
        },
        cancelUnrelatedTouch: async ({page, iframe, context}) => {
          let target = iframe.locator('[data-verification-root] [role=button]');
          let other = iframe.locator('[data-other-pointer]');
          let targetBox = (await target.boundingBox())!;
          let otherBox = (await other.boundingBox())!;
          let session = await context.newCDPSession(page);
          await page.mouse.move(targetBox.x + 5, targetBox.y + 5);
          await page.mouse.down();
          try {
            await session.send('Input.dispatchTouchEvent', {
              type: 'touchStart',
              touchPoints: [{x: otherBox.x + 5, y: otherBox.y + 5, id: 2}]
            });
            await session.send('Input.dispatchTouchEvent', {type: 'touchCancel', touchPoints: []});
            return await target.getAttribute('data-pressed');
          } finally {
            await page.mouse.up();
            await session.detach();
          }
        }
      }
    }
  }
});
