/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {idsUpdaterMap} from '../src/useId';
import React, {Suspense, useState} from 'react';
import {useId} from '../';

export default {
  title: 'useId'
};


let count = 0;
function AsyncComponent() {
  if (count < 5) {
    throw new Promise((resolve) => {
      return setTimeout(() => {
        console.log('resolving', count, Date.now());
        count++;
        resolve(true);
      }, 100);
    });
  }

  return null;
}

function TestUseId() {
  let [show, setShow] = useState(true);
  return (
    <div>
      {show && (
        <Suspense>
          <Box />
          <AsyncComponent />
        </Suspense>
      )}
      <button
        onClick={() => {
          count = 0;
          setShow((prev) => !prev);
        }}>toggle</button>
      <button
        onClick={() => {
          console.log(idsUpdaterMap);
        }}>See ids held</button>
    </div>
  );
}

function Box() {
  const id = useId();
  return (
    <div data-id={id}>
      {id}
    </div>
  );
}

export const GCuseId = {
  render: () => <TestUseId />,
  parameters: {
    description: {
      data: 'This story demonstrates garbage collection cleanup of useId hook. Depends on the browser when it happens. Easiest to see by rendering, clicking the toggle button twice, then waiting for the GC or, if you are in chrome, you can force GC to run with developer tools in the memory tab.'
    }
  }
};
