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

import {act, render} from '@react-spectrum/test-utils-internal';
import React, {StrictMode, useRef} from 'react';
import {render as renderWithoutWrapper} from '@testing-library/react';
import {useEnterAnimation, useExitAnimation} from '../../src/utils/animation';

function deferred() {
  let resolve!: () => void;
  let promise = new Promise<void>(r => (resolve = r));
  return {promise, resolve};
}

describe('animation', () => {
  beforeEach(() => {
    // jsdom skips animations unless getAnimations is implemented.
    Element.prototype.getAnimations = () => [];
  });

  afterEach(() => {
    // @ts-expect-error
    delete Element.prototype.getAnimations;
  });

  it('finishes an enter animation that starts on mount in StrictMode', async () => {
    let enter = deferred();
    let onEnter = jest.fn(() => enter.promise);
    function Test() {
      let ref = useRef<HTMLDivElement>(null);
      let isEntering = useEnterAnimation(ref, true, onEnter);
      return <div ref={ref} data-testid="el" data-entering={isEntering || undefined} />;
    }

    // StrictMode only re-runs effects on mount when it is the root element, which the
    // STRICT_MODE wrapper used by render is not.
    let {getByTestId} = renderWithoutWrapper(
      <StrictMode>
        <Test />
      </StrictMode>
    );
    let el = getByTestId('el');
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(el).toHaveAttribute('data-entering');

    await act(async () => enter.resolve());
    expect(el).not.toHaveAttribute('data-entering');
  });

  it('ignores an interrupted exit animation that settles during a later exit', async () => {
    let first = deferred();
    let second = deferred();
    let onExit = jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    function Test({isOpen}: {isOpen: boolean}) {
      let ref = useRef<HTMLDivElement>(null);
      let isExiting = useExitAnimation(ref, isOpen, onExit);
      if (!isOpen && !isExiting) {
        return null;
      }
      return <div ref={ref} data-testid="el" data-exiting={isExiting || undefined} />;
    }

    let {getByTestId, rerender} = render(<Test isOpen />);
    let el = getByTestId('el');

    rerender(<Test isOpen={false} />);
    rerender(<Test isOpen />);
    rerender(<Test isOpen={false} />);
    expect(onExit).toHaveBeenCalledTimes(2);

    await act(async () => first.resolve());
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-exiting');

    await act(async () => second.resolve());
    expect(el).not.toBeInTheDocument();
  });
});
