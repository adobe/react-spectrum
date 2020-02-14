/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useTooltip} from '../';

describe('useTooltip', function () {
  afterEach(cleanup);

  let renderTooltipHook = (props) => {
    let {result} = renderHook(() => useTooltip(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {tooltipProps} = renderTooltipHook({children: 'Test Tooltip'});
    expect(tooltipProps.role).toBe('tooltip');
    expect(tooltipProps.id).toBeTruthy();
  });
});
