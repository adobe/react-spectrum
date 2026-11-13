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

import {screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('Slider SSR', function () {
  it('should render with NumberField without hydration errors', async function () {
    await testSSR(
      __filename,
      `
      import {Input, Label, NumberField, Slider, SliderThumb, SliderTrack} from '../exports/index.ts';

      <React.StrictMode>
        <Slider defaultValue={0.5} maxValue={1} step={0.01} formatOptions={{style: 'percent'}}>
          <Label>Opacity</Label>
          <SliderTrack>
            <SliderThumb />
          </SliderTrack>
          <NumberField slot="0">
            <Input />
          </NumberField>
        </Slider>
      </React.StrictMode>
    `,
      () => {
        expect(screen.getByRole('slider', {name: 'Opacity'})).toHaveValue('0.5');
        expect(screen.getByRole('textbox', {name: 'Opacity'})).toHaveValue('50%');
      }
    );

    expect(screen.getByRole('slider', {name: 'Opacity'})).toHaveValue('0.5');
    expect(screen.getByRole('textbox', {name: 'Opacity'})).toHaveValue('50%');
  });
});
