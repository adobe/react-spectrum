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

import {describe, expect, it} from 'vitest';
import {render} from './utils/render';
import {Tag, TagGroup} from '../src';

describe('TagGroup', () => {
  it('renders', async () => {
    const screen = await render(
      <TagGroup label="Ice cream flavors">
        <Tag>Chocolate</Tag>
        <Tag>Mint</Tag>
        <Tag>Strawberry</Tag>
        <Tag>Vanilla</Tag>
        <Tag>Chocolate Chip Cookie Dough</Tag>
        <Tag>Rocky Road</Tag>
        <Tag>Butter Pecan</Tag>
        <Tag>Neapolitan</Tag>
        <Tag>Salted Caramel</Tag>
        <Tag>Mint Chocolate Chip</Tag>
        <Tag>Tonight Dough</Tag>
        <Tag>Lemon Cookie</Tag>
        <Tag>Cookies and Cream</Tag>
        <Tag>Phish Food</Tag>
        <Tag>Peanut Butter Cup</Tag>
        <Tag>Coffee</Tag>
        <Tag>Pistachio</Tag>
        <Tag>Cherry</Tag>
      </TagGroup>
    );
    expect(screen.container.firstChild).toBeInTheDocument();
  });
});
