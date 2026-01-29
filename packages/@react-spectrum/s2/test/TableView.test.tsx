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

import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView
} from '../src';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('TableView', () => {
  it('renders', async () => {
    const screen = await render(
      <TableView aria-label="File manager">
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Date Modified</Column>
        </TableHeader>
        <TableBody>
          <Row id="1">
            <Cell>Projects</Cell>
            <Cell>File folder</Cell>
            <Cell>6/7/2025</Cell>
          </Row>
          <Row id="2">
            <Cell>Pictures</Cell>
            <Cell>File folder</Cell>
            <Cell>4/7/2025</Cell>
          </Row>
          <Row id="3">
            <Cell>2024 Annual Financial Report</Cell>
            <Cell>Text document</Cell>
            <Cell>12/30/2024</Cell>
          </Row>
          <Row id="4">
            <Cell>Job Posting</Cell>
            <Cell>Text Document</Cell>
            <Cell>1/18/2025</Cell>
          </Row>
        </TableBody>
      </TableView>
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
