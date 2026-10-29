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

import base from '../vitest.browser.config';
import type {CDPSession} from 'playwright';
import {conformModel, loadModel} from './model.mjs';
import {deadline} from './runtime.mjs';
import {defineConfig} from 'vitest/config';
import {instrumentation} from './instrumentation';
import {join} from 'node:path';
import {readFileSync, writeFileSync} from 'node:fs';

// Invoked by verification/targets.mjs with a VERIFY_REQUEST_PATH file describing one
// explore or replay run. jsdom is used for search; Chromium for replaying traces.
let request = process.env.VERIFY_REQUEST_PATH
  ? JSON.parse(readFileSync(process.env.VERIFY_REQUEST_PATH, 'utf8'))
  : null;
if (!request) {
  throw new Error('Run targets through `yarn verify explore` or `yarn verify replay`.');
}
let chromium = request.environment === 'chromium';
let session: CDPSession | undefined;

export default defineConfig({
  ...base,
  plugins: [...(base.plugins || []), instrumentation()],
  define: {...base.define, __VERIFY_REQUEST__: JSON.stringify(request)},
  test: {
    ...base.test,
    include: ['verification/targets.runner.tsx'],
    setupFiles: [],
    ...(chromium ? {} : {environment: 'jsdom'}),
    // Cooperative deadlines preserve the environment until cleanup finishes.
    // The parent process terminates hung actions or model checks.
    testTimeout: 0,
    browser: chromium
      ? {
          ...base.test!.browser,
          screenshotFailures: false,
          instances: [
            {browser: 'chromium', name: 'chromium', viewport: {width: 1280, height: 720}}
          ],
          commands: {
            ...base.test!.browser!.commands,
            verifyConformance: async (_context, metadata, paths, timeoutMs) => {
              let model = loadModel(join(__dirname, request.target), metadata.model.spec);
              return conformModel(
                {...metadata, model: {...metadata.model, project: value => value}},
                model,
                paths,
                {checkDeadline: deadline(timeoutMs)}
              );
            },
            writeVerifyResult: async (_context, result) => {
              writeFileSync(request.output, JSON.stringify(result, null, 2) + '\n');
            },
            // One session, because Chromium tracks active touch points per page.
            verifyTouch: async ({page, iframe, context}: any, selector, type) => {
              session ??= await context.newCDPSession(page);
              if (type === 'cancel') {
                await session!.send('Input.dispatchTouchEvent', {
                  type: 'touchCancel',
                  touchPoints: []
                });
                return;
              }
              let box = await iframe.locator(selector).boundingBox();
              await session!.send('Input.dispatchTouchEvent', {
                type: 'touchStart',
                touchPoints: [{x: box.x + box.width / 2, y: box.y + box.height / 2, id: 2}]
              });
            }
          }
        }
      : {enabled: false}
  }
});
