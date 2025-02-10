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

import React, {useId as useReactId, useState, useCallback, Suspense, useRef, useEffect} from 'react';
import {render, act} from '@react-spectrum/test-utils-internal';
import {idsUpdaterMap, useId} from '../src/useId';


describe('useId', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it('does not leak memory in suspense', async () => {
    if (React.version.startsWith('18')) {
      let tree = render(<App />);
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      global.gc();
      console.log(idsUpdaterMap);
      expect(idsUpdaterMap.size).toBe(1);
    }
  });
  it('does not leak memory in suspense', async () => {
    if (React.version.startsWith('18')) {
      let tree = render(<App2 />);
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      await act(async () => {
        jest.advanceTimersByTime(20);
        await Promise.resolve();
      });
      global.gc();
      console.log(idsUpdaterMap);
      expect(idsUpdaterMap.size).toBe(1);
    }
  });
});


let count = 0;
function AsyncComponent() {
  if (count < 5) {
    throw new Promise((resolve) => {
        console.log("resolving", count, Date.now());
        count++;
        resolve(true);
    });
  }

  return null;
}

function App() {
  let [show, setShow] = useState(true);
  return (
    <div>
      {show && (
        <Suspense>
          <SuspenseSafeSibling />
          <AsyncComponent />
        </Suspense>
      )}
      <button onClick={() => setShow((prev) => !prev)}>toggle</button>
    </div>
  );
}

function App2() {
  let [show, setShow] = useState(true);
  return (
    <div>
      {show && (
        <Suspense>
          <Box />
          <AsyncComponent />
        </Suspense>
      )}
      <button onClick={() => setShow((prev) => !prev)}>toggle</button>
    </div>
  );
}

function SuspenseSafeSibling(props) {
  let [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  return show ? props.children : null;
}

function Box() {
  const id = useId();
  const rid = useReactId();
  let myRef = useRef(rid);
  let myotherRef = useCallback(
    () => console.log("ref called!!!!!!!!!!!!!"),
    []
  );
  console.log("render box", id, rid, myRef.current);
  useEffect(() => {
    console.log("box mounted", myRef.current);
    return () => {
      console.log("box unmounted");
    };
  });
  return (
    <button ref={myotherRef} data-id={id}>
      {id}
    </button>
  );
}
