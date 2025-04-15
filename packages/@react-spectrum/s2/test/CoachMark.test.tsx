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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {
  Button,
  Checkbox,
  UNSTABLE_CoachMark as CoachMark,
  UNSTABLE_CoachMarkTrigger as CoachMarkTrigger
} from '../src';
import React, {createRef, useState} from 'react';
import userEvent, {UserEvent} from '@testing-library/user-event';

const mockAnimations = () => {
  Element.prototype.animate = jest.fn().mockImplementation(() => ({finished: Promise.resolve()}));
};

describe('CoachMark', () => {
  let user: UserEvent | null = null;
  beforeAll(() => {
    jest.useFakeTimers();
    mockAnimations();
  });
  beforeEach(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  afterAll(() => {
    act(() => {jest.runAllTimers();});
  });

  function CoachMarkTest(props) {
    let [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button onPress={() => setIsOpen(true)}>Show coachmark</Button>
        <CoachMarkTrigger isOpen={isOpen}>
          <Checkbox>Sync with CC</Checkbox>
          <CoachMark placement="right top" ref={props.coachmarkRef}>
            <div>
              <Button variant="secondary">Previous</Button>
              <Button variant="primary" onPress={() => setIsOpen(false)}>Next</Button>
            </div>
          </CoachMark>
        </CoachMarkTrigger>
      </div>
    );
  }

  it('renders a coachmark', async () => {
    let coachmarkRef = createRef<HTMLDivElement>();
    let {getAllByRole} = render(
      <CoachMarkTest coachmarkRef={coachmarkRef} />
    );
    coachmarkRef.current!.showPopover = jest.fn();
    coachmarkRef.current!.hidePopover = jest.fn();
    let startButton = getAllByRole('button')[0];
    await user?.click(startButton);
    act(() => {jest.runAllTimers();});
    expect(coachmarkRef.current!.showPopover).toHaveBeenCalled();
    expect(getAllByRole('button').length).toBe(3); // start, previous, next
    await user?.click(getAllByRole('button')[2]);
    expect(coachmarkRef.current!.hidePopover).toHaveBeenCalled();
  });
});
