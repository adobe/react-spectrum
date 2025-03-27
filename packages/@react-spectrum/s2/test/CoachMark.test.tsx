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

import {act, ByRoleMatcher, ByRoleOptions, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {ActionMenu, Button, CardPreview, Checkbox, CoachMark, CoachMarkTrigger, Content, Footer, Image, Keyboard, MenuItem, Text} from '../src';
import React, {useState} from 'react';
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
    let {getByRole} = render(
      <div>
        <Button>Before</Button>
        <CoachMarkTrigger defaultOpen>
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
        <Button>After</Button>
      </div>
    );
    act(() => {jest.runAllTimers();});
    await user?.click(getByRole('button', {name: 'Next'}));
    expect(onPress).toHaveBeenCalled();
  });

  async function testFocusMovement(getByRole: (role: ByRoleMatcher, options?: ByRoleOptions | undefined) => HTMLElement, user: UserEvent | null) {
    act(() => {jest.runAllTimers();});
    await user?.tab(); // Before
    await user?.keyboard('{Enter}');
    act(() => {jest.runAllTimers();});
    await user?.tab(); // Trigger
    await user?.tab(); // More actions

    expect(getByRole('button', {name: 'More actions'})).toHaveFocus();

    await user?.tab({shift: true}); // Back to trigger

    expect(getByRole('checkbox', {name: 'Sync with CC'})).toHaveFocus();

    await user?.tab(); // More actions

    expect(getByRole('button', {name: 'More actions'})).toHaveFocus();

    await user?.tab(); // Previous
    await user?.tab(); // Next
    await user?.tab(); // After
    // this goes to body, and either testing library or jsdom is not smart enough to move it along to the the After button
    // so forcibly move it there
    // leave an assertion in here in case this changes in the future, we'll know
    expect(getByRole('button', {name: 'After'})).not.toHaveFocus();
    act(() => {
      getByRole('button', {name: 'After'}).focus();
    });

    expect(getByRole('button', {name: 'After'})).toHaveFocus();

    await user?.tab({shift: true}); // Back to Next

    // Listen for key up on the trigger, key === tab and shift === true, send focus to last
    expect(getByRole('button', {name: 'Next'})).toHaveFocus();
  }

  it('coachmark pretends to be in document order with its trigger', async () => {
    let {getByRole} = render(
      <div>
        <Button>Before</Button>
        <CoachMarkTrigger defaultOpen>
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
              <Button variant="primary">Next</Button>
            </Footer>
          </CoachMark>
        </CoachMarkTrigger>
        <Button>After</Button>
      </div>
    );
    await testFocusMovement(getByRole, user);
  });

  function ControlledCoachMark() {
    let [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onPress={() => setIsOpen(true)}>Before</Button>
        <CoachMarkTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
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
              <Button variant="primary">Next</Button>
            </Footer>
          </CoachMark>
        </CoachMarkTrigger>
        <Button onPress={() => setIsOpen(false)}>After</Button>
      </div>
    );
  }
  it('controlled coachmark pretends to be in document order with its trigger', async () => {
    let {getByRole} = render(
      <ControlledCoachMark />
    );
    await testFocusMovement(getByRole, user);
  });

  it.skip('can be closed with the escape key from anywhere in the app', async () => {
    let {getByRole} = render(
      <div>
        <Button>Before</Button>
        <CoachMarkTrigger defaultOpen>
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
              <Button variant="primary">Next</Button>
            </Footer>
          </CoachMark>
        </CoachMarkTrigger>
        <Button>After</Button>
      </div>
    );

    await user?.tab();
    let previousButton = getByRole('button', {name: 'Previous'});
    expect(previousButton).toBeInTheDocument();
    await user?.keyboard('{Escape}');
    expect(previousButton).not.toBeInTheDocument();
  });

  it('can be closed with the escape key from inside the coachmark', async () => {
    let {getByRole} = render(
      <div>
        <Button>Before</Button>
        <CoachMarkTrigger defaultOpen>
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
              <Button variant="primary">Next</Button>
            </Footer>
          </CoachMark>
        </CoachMarkTrigger>
        <Button>After</Button>
      </div>
    );

    let previousButton = getByRole('button', {name: 'Previous'});
    await user?.tab(); // Before
    await user?.tab(); // Trigger
    await user?.tab(); // More actions
    expect(previousButton).toBeInTheDocument();
    await user?.keyboard('{Escape}');
    expect(previousButton).not.toBeInTheDocument();
  });

  it('will stay open if something inside the coachmark handles the escape key', async () => {
    let {getByRole} = render(
      <div>
        <Button>Before</Button>
        <CoachMarkTrigger defaultOpen>
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
              <Button variant="primary">Next</Button>
            </Footer>
          </CoachMark>
        </CoachMarkTrigger>
        <Button>After</Button>
      </div>
    );

    let previousButton = getByRole('button', {name: 'Previous'});
    await user?.tab(); // Before
    await user?.tab(); // Trigger
    await user?.tab(); // More actions
    await user?.keyboard('{Enter}');

    expect(getByRole('menu')).toBeInTheDocument();
    expect(previousButton).toBeInTheDocument();

    await user?.keyboard('{Escape}');
    act(() => {jest.runAllTimers();});

    expect(previousButton).toBeInTheDocument();

    await user?.keyboard('{Escape}');
    act(() => {jest.runAllTimers();});
    expect(previousButton).not.toBeInTheDocument();
  });
});
