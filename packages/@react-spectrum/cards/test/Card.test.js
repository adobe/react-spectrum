/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Card} from '../src';
import {Default, DefaultPreviewAlt, NoDescription} from '../stories/Card.stories';
import React from 'react';
import {render} from '@testing-library/react';

describe('Card', function () {
  it.each`
    Name         | Component | props
    ${'Default'} | ${Default}   | ${{}}
  `('$Name is labelled and described', function ({Component, props}) {
    let {getByRole, getByLabelText} = render(<Card {...Default.args} />);
    let card = getByRole('article');
    let heading = getByRole('heading', {level: 3});
    let image = getByRole('img');
    let labelledCard = getByLabelText(heading.textContent);
    expect(card).toBe(labelledCard);
    expect(card).toHaveAccessibleDescription('Description');
    expect(image).not.toHaveAccessibleName();
  });

  it.each`
    Name               | Component          | props
    ${'NoDescription'} | ${NoDescription}   | ${{}}
  `('$Name is labelled and not described', function ({Component, props}) {
    let {getByRole, queryByRole} = render(<Card {...NoDescription.args} />);
    let card = getByRole('article');
    let heading = getByRole('heading', {level: 3});
    let section = queryByRole('section');
    expect(section).toBeNull();
    expect(card).toHaveAttribute('aria-labelledby', heading.id);
    expect(card).not.toHaveAccessibleDescription();
  });

  it.each`
    Name                   | Component              | props
    ${'DefaultPreviewAlt'} | ${DefaultPreviewAlt}   | ${{}}
  `('$Name has a labelled image', function ({Component, props}) {
    let {getByRole} = render(<Card {...DefaultPreviewAlt.args} />);
    let image = getByRole('img');
    expect(image).toHaveAccessibleName('preview');
  });
});
