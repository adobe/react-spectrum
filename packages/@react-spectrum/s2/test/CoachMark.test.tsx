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
  ActionMenu,
  Button,
  CardPreview,
  Checkbox,
  Content,
  Footer,
  Image,
  Keyboard,
  MenuItem,
  Text
} from '../src';
import {CoachMark, CoachMarkTrigger} from '../src/CoachMark';
import React from 'react';
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

  it('renders a coachmark', async () => {
    let onPress = jest.fn();
    let {getAllByRole} = render(
      <CoachMarkTrigger isOpen>
        <Checkbox>Sync with CC</Checkbox>
        <CoachMark placement="right top">
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary" onPress={onPress}>Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
    );
    act(() => {jest.runAllTimers();});
    expect(getAllByRole('button').length).toBe(4); // 2 Dismiss + 2 actions
    await user?.click(getAllByRole('button')[2]);
    expect(onPress).toHaveBeenCalled();
  });
});
