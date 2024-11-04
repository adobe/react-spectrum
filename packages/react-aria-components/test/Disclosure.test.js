/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover
} from 'react-aria-components';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import userEvent from '@testing-library/user-event';

describe('Disclosure', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null});
    jest.useFakeTimers();
  });

  it('should render a Disclosure with default class', () => {
    const {container} = render(
      <Disclosure>
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = container.querySelector('.react-aria-Disclosure');
    expect(disclosure).toBeInTheDocument();
  });

  it('should render a Disclosure with custom class', () => {
    const {getByTestId} = render(
      <Disclosure data-testid="disclosure" className="test-class">
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = getByTestId('disclosure');
    expect(disclosure).toHaveClass('test-class');
  });

  it('should support DOM props', () => {
    const {getByTestId} = render(
      <Disclosure data-testid="disclosure" data-foo="bar">
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = getByTestId('disclosure');
    expect(disclosure).toHaveAttribute('data-foo', 'bar');
  });

  it('should support disabled state', () => {
    const {getByTestId, getByRole} = render(
      <Disclosure data-testid="disclosure" isDisabled>
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = getByTestId('disclosure');
    expect(disclosure).toHaveAttribute('data-disabled', 'true');

    const button = getByRole('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('data-disabled', 'true');
  });

  it('should support controlled isExpanded prop', async () => {
    const onExpandedChange = jest.fn();
    const {getByTestId, getByRole, queryByText} = render(
      <Disclosure
        data-testid="disclosure"
        isExpanded
        onExpandedChange={onExpandedChange}>
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = getByTestId('disclosure');
    const panel = queryByText('Content');
    expect(disclosure).toHaveAttribute('data-expanded', 'true');
    expect(panel).toBeVisible();

    const button = getByRole('button');
    await user.click(button);

    expect(onExpandedChange).toHaveBeenCalledWith(false);
    expect(disclosure).toHaveAttribute('data-expanded', 'true');
    expect(panel).toBeVisible();
  });

  it('should toggle expanded state when trigger is clicked', async () => {
    const {getByTestId, getByRole, queryByText} = render(
      <Disclosure data-testid="disclosure">
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = getByTestId('disclosure');
    const panel = queryByText('Content');
    expect(disclosure).not.toHaveAttribute('data-expanded');
    expect(panel).not.toBeVisible();

    const button = getByRole('button');
    await user.click(button);

    expect(disclosure).toHaveAttribute('data-expanded', 'true');
    expect(panel).toBeVisible();

    await user.click(button);

    expect(disclosure).not.toHaveAttribute('data-expanded');
    expect(panel).not.toBeVisible();
  });

  it('should support render props', async () => {
    const {getByRole, getByText} = render(
      <Disclosure>
        {({isExpanded}) => (
          <>
            <Heading level={3}>
              <Button slot="trigger">
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </Heading>
            <DisclosurePanel>
              <p>Content</p>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    );
    const button = getByRole('button');
    const panel = getByText('Content');
    expect(button).toHaveTextContent('Expand');

    await user.click(button);
    expect(button).toHaveTextContent('Collapse');
    expect(panel).toBeVisible();
  });

  it('should support focus ring', async () => {
    const {getByTestId, getByRole} = render(
      <Disclosure
        data-testid="disclosure"
        className={({isFocusVisibleWithin}) =>
          isFocusVisibleWithin ? 'focus' : ''
        }>
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );

    const disclosure = getByTestId('disclosure');
    const button = getByRole('button');

    expect(disclosure).not.toHaveAttribute('data-focus-visible-within');
    expect(disclosure).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(button);

    expect(disclosure).toHaveAttribute('data-focus-visible-within', 'true');
    expect(disclosure).toHaveClass('focus');

    await user.tab();
    expect(disclosure).not.toHaveAttribute('data-focus-visible-within');
    expect(disclosure).not.toHaveClass('focus');
  });

  it('should support interactive elements adjacent to heading', async () => {
    const {getByTestId, queryByText} = render(
      <Disclosure data-testid="disclosure">
        <Heading level={3}>
          <Button slot="trigger" data-testid="disclosure-trigger">Trigger</Button>
        </Heading>
        <MenuTrigger>
          <Button aria-label="Menu" data-testid="menu-trigger">☰</Button>
          <Popover>
            <Menu data-testid="menu">
              <MenuItem id="open">Open</MenuItem>
              <MenuItem id="rename">Rename…</MenuItem>
              <MenuItem id="duplicate">Duplicate</MenuItem>
              <MenuItem id="share">Share…</MenuItem>
              <MenuItem id="delete">Delete…</MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );
    const disclosure = getByTestId('disclosure');
    const panel = queryByText('Content');
    const menuTrigger = getByTestId('menu-trigger');
    expect(disclosure).not.toHaveAttribute('data-expanded');
    expect(panel).not.toBeVisible();
    
    await user.click(menuTrigger);
    const menu = getByTestId('menu');
    expect(menu).toBeVisible();
    expect(disclosure).not.toHaveAttribute('data-expanded');
    expect(panel).not.toBeVisible();
    await user.click(document.body);
    expect(menu).not.toBeVisible();

    const button = getByTestId('disclosure-trigger');
    await user.click(button);

    expect(disclosure).toHaveAttribute('data-expanded', 'true');
    expect(panel).toBeVisible();
    expect(menu).not.toBeVisible();

    await user.click(button);

    expect(disclosure).not.toHaveAttribute('data-expanded');
    expect(panel).not.toBeVisible();
    expect(menu).not.toBeVisible();
  });

  it('should support nested Disclosures', async () => {
    const {getByText, queryByText} = render(
      <Disclosure>
        <Heading level={3}>
          <Button slot="trigger">Trigger 1</Button>
        </Heading>
        <DisclosurePanel>
          <Disclosure>
            <Heading level={3}>
              <Button slot="trigger">Trigger 2</Button>
            </Heading>
            <DisclosurePanel>
              <p>Content 2</p>
            </DisclosurePanel>
          </Disclosure>
        </DisclosurePanel>
      </Disclosure>
    );

    const trigger1 = getByText('Trigger 1');
    const trigger2 = getByText('Trigger 2');
    let panel2 = queryByText('Content 2');

    expect(panel2).not.toBeVisible();

    await user.click(trigger1);
    expect(panel2).not.toBeVisible();

    await user.click(trigger2);
    expect(panel2).toBeVisible();

    await user.click(trigger2);
    expect(panel2).not.toBeVisible();
  });

  it('should not expand or collapse on repeat keydown events', async () => {
    let onExpandedChange = jest.fn();
    const {getByRole, queryByText} = render(
      <Disclosure onExpandedChange={onExpandedChange}>
        <Heading level={3}>
          <Button slot="trigger">Trigger</Button>
        </Heading>
        <DisclosurePanel>
          <p>Content</p>
        </DisclosurePanel>
      </Disclosure>
    );

    const panel = queryByText('Content');
    const button = getByRole('button');

    await user.tab();

    expect(panel).not.toBeVisible();
    expect(button).toHaveFocus();

    // press Enter for 4 keydown events, then release it
    await user.keyboard('{Enter>4/}');
    expect(panel).toBeVisible();
    expect(onExpandedChange).toHaveBeenCalledTimes(1);

    await user.keyboard('{Enter>4/}');
    expect(panel).not.toBeVisible();
    expect(onExpandedChange).toHaveBeenCalledTimes(2);
  });
});

describe('DisclosureGroup', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null});
    jest.useFakeTimers();
  });

  it('should render a DisclosureGroup with default class', () => {
    const {container} = render(
      <DisclosureGroup>
        <Disclosure id="item1">
          <Heading level={3}>
            <Button slot="trigger">Trigger 1</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 1</p>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="item2">
          <Heading level={3}>
            <Button slot="trigger">Trigger 2</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 2</p>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    );
    const group = container.querySelector('.react-aria-DisclosureGroup');
    expect(group).toBeInTheDocument();
  });

  it('should only allow one Disclosure to be expanded at a time by default', async () => {
    const {getByText, queryByText} = render(
      <DisclosureGroup>
        <Disclosure id="item1">
          <Heading level={3}>
            <Button slot="trigger">Trigger 1</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 1</p>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="item2">
          <Heading level={3}>
            <Button slot="trigger">Trigger 2</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 2</p>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    );

    const trigger1 = getByText('Trigger 1');
    const trigger2 = getByText('Trigger 2');
    let panel1 = queryByText('Content 1');
    let panel2 = queryByText('Content 2');

    expect(panel1).not.toBeVisible();
    expect(panel2).not.toBeVisible();

    await user.click(trigger1);
    expect(panel1).toBeVisible();
    expect(panel2).not.toBeVisible();

    await user.click(trigger2);
    expect(panel1).not.toBeVisible();
    expect(panel2).toBeVisible();

    await user.click(trigger2);
    expect(panel1).not.toBeVisible();
    expect(panel2).not.toBeVisible();
  });

  it('should allow multiple Disclosures to be expanded when allowsMultipleExpanded is true', async () => {
    const {getByText, queryByText} = render(
      <DisclosureGroup allowsMultipleExpanded>
        <Disclosure id="item1">
          <Heading level={3}>
            <Button slot="trigger">Trigger 1</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 1</p>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="item2">
          <Heading level={3}>
            <Button slot="trigger">Trigger 2</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 2</p>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    );

    const trigger1 = getByText('Trigger 1');
    const trigger2 = getByText('Trigger 2');
    let panel1 = queryByText('Content 1');
    let panel2 = queryByText('Content 2');

    expect(panel1).not.toBeVisible();
    expect(panel2).not.toBeVisible();

    await user.click(trigger1);
    expect(panel1).toBeVisible();
    expect(panel2).not.toBeVisible();

    await user.click(trigger2);
    expect(panel1).toBeVisible();
    expect(panel2).toBeVisible();
  });

  it('should support controlled expandedKeys prop', async () => {
    function ControlledDisclosureGroup() {
      const [expandedKeys, setExpandedKeys] = React.useState(['item1']);
      return (
        <>
          <button onClick={() => setExpandedKeys(['item2'])}>
            Expand item2
          </button>
          <DisclosureGroup expandedKeys={expandedKeys}>
            <Disclosure id="item1">
              <Heading level={3}>
                <Button slot="trigger">Trigger 1</Button>
              </Heading>
              <DisclosurePanel>
                <p>Content 1</p>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="item2">
              <Heading level={3}>
                <Button slot="trigger">Trigger 2</Button>
              </Heading>
              <DisclosurePanel>
                <p>Content 2</p>
              </DisclosurePanel>
            </Disclosure>
          </DisclosureGroup>
        </>
      );
    }

    const {getByText, queryByText} = render(<ControlledDisclosureGroup />);

    let panel1 = queryByText('Content 1');
    let panel2 = queryByText('Content 2');

    expect(panel1).toBeVisible();
    expect(panel2).not.toBeVisible();

    await user.click(getByText('Expand item2'));

    expect(panel1).not.toBeVisible();
    expect(panel2).toBeVisible();
  });

  it('should call onExpandedChange when a Disclosure is toggled', async () => {
    const onExpandedChange = jest.fn();
    const {getByText} = render(
      <DisclosureGroup onExpandedChange={onExpandedChange}>
        <Disclosure id="item1">
          <Heading level={3}>
            <Button slot="trigger">Trigger 1</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 1</p>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    );

    const trigger1 = getByText('Trigger 1');

    await user.click(trigger1);

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    const expandedKeys = onExpandedChange.mock.calls[0][0];
    expect(expandedKeys.has('item1')).toBe(true);
  });

  it('should disable all Disclosures when DisclosureGroup is disabled', () => {
    const {getAllByRole} = render(
      <DisclosureGroup isDisabled>
        <Disclosure id="item1">
          <Heading level={3}>
            <Button slot="trigger">Trigger 1</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 1</p>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="item2">
          <Heading level={3}>
            <Button slot="trigger">Trigger 2</Button>
          </Heading>
          <DisclosurePanel>
            <p>Content 2</p>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    );

    const buttons = getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('data-disabled', 'true');
      expect(button).toHaveAttribute('disabled');
    });
  });

  it('should support nested DisclosureGroups', async () => {
    const {getByText, queryByText} = render(
      <DisclosureGroup>
        <Disclosure id="item1">
          <Heading level={3}>
            <Button slot="trigger">Trigger 1</Button>
          </Heading>
          <DisclosurePanel>
            <DisclosureGroup>
              <Disclosure id="item2">
                <Heading level={3}>
                  <Button slot="trigger">Trigger 2</Button>
                </Heading>
                <DisclosurePanel>
                  <p>Content 2</p>
                </DisclosurePanel>
              </Disclosure>
            </DisclosureGroup>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    );

    const trigger1 = getByText('Trigger 1');
    const trigger2 = getByText('Trigger 2');
    let panel2 = queryByText('Content 2');

    expect(panel2).not.toBeVisible();

    await user.click(trigger1);
    expect(panel2).not.toBeVisible();

    await user.click(trigger2);
    expect(panel2).toBeVisible();

    await user.click(trigger2);
    expect(panel2).not.toBeVisible();
  });
});
