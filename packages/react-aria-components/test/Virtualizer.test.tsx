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
  Cell,
  Column,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Row,
  Table,
  TableBody,
  TableHeader,
  Virtualizer
} from 'react-aria-components';
import {CollectionRendererContext} from '../src/Collection';
import React, {useMemo} from 'react';
import {render, within} from '@react-spectrum/test-utils-internal';
import {TableLayout} from '@react-stately/layout';
import userEvent from '@testing-library/user-event';

describe('Virtualizer', () => {
  it('does not leak CollectionRendererContext into overlay content (e.g. Menu)', async () => {
    let user = userEvent.setup({delay: null, pointerEventsCheck: 0});
    function TestApp() {
      let layout = useMemo(
        () =>
          new TableLayout({
            rowHeight: 24,
            headingHeight: 24
          }),
        []
      );

      return (
        <Virtualizer layout={layout}>
          <Table aria-label="Table">
            <TableHeader>
              <Column isRowHeader id="name">
                Name
                <MenuTrigger>
                  <Button>Trigger</Button>
                  <Popover>
                    <Menu aria-label="Menu">
                      <MenuItem id="item-1">Item 1</MenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              </Column>
            </TableHeader>
            <TableBody>
              <Row id="row-1">
                <Cell>Cell 1</Cell>
              </Row>
            </TableBody>
          </Table>
        </Virtualizer>
      );
    }

    let {getByRole} = render(<TestApp />);
    let button = getByRole('button');
    await user.click(button);

    let menu = getByRole('menu');
    expect(menu).toBeInTheDocument();

    let item = within(menu).getByRole('menuitem');
    expect(item).toHaveTextContent('Item 1');
  });

  it('allows an explicit nested Virtualizer inside an overlay', async () => {
    let user = userEvent.setup({delay: null, pointerEventsCheck: 0});
    function TestApp() {
      let outerLayout = useMemo(() => new TableLayout({rowHeight: 24, headingHeight: 24}), []);
      let innerLayout = useMemo(() => new TableLayout({rowHeight: 24, headingHeight: 24}), []);

      return (
        <Virtualizer layout={outerLayout}>
          <MenuTrigger>
            <Button>Trigger</Button>
            <Popover>
              <Virtualizer layout={innerLayout}>
                <div data-testid="nested-virtualizer">Nested</div>
              </Virtualizer>
            </Popover>
          </MenuTrigger>
        </Virtualizer>
      );
    }

    let {getByRole, getByTestId} = render(<TestApp />);
    await user.click(getByRole('button'));

    expect(getByTestId('nested-virtualizer')).toBeInTheDocument();
  });

  it('allows Virtualizer to intentionally wrap a standalone Popover', async () => {
    function Inner() {
      let {isVirtualized} = React.useContext(CollectionRendererContext);
      return <div data-testid="is-virtualized">{String(isVirtualized)}</div>;
    }

    function TestApp() {
      let layout = useMemo(() => new TableLayout({rowHeight: 24, headingHeight: 24}), []);

      return (
        <Virtualizer layout={layout}>
          <Popover isOpen triggerRef={{current: document.body}}>
            <Inner />
          </Popover>
        </Virtualizer>
      );
    }

    let {getByTestId} = render(<TestApp />);
    expect(getByTestId('is-virtualized')).toHaveTextContent('true');
  });
});
