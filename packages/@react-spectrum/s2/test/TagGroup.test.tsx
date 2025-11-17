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

import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {Tag, TagGroup} from '../';

let TestTagGroup = ({tagGroupProps, itemProps}) => (
  <TagGroup data-testid="group" {...tagGroupProps}>
    <Tag {...itemProps} id="cat">Cat</Tag>
    <Tag {...itemProps} id="dog">Dog</Tag>
    <Tag {...itemProps} id="kangaroo">Kangaroo</Tag>
  </TagGroup>
);

let renderTagGroup = (tagGroupProps = {}, itemProps = {}) => render(<TestTagGroup {...{tagGroupProps, itemProps}} />);

describe('TagGroup', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('should aria label on tags', () => {
    let {getAllByRole} = renderTagGroup({label: 'TagGroup label'}, {'aria-label': 'Test'});

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('aria-label', 'Test');
    }
  });
});
