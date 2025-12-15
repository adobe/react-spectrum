/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Image, Provider} from '../src';
import {render} from '@react-spectrum/test-utils-internal';

describe('Image', () => {
  it('should support conditional sources', async () => {
    let {getByRole} = render(
      <Image
        alt="test"
        src={[
          {srcSet: 'foo.png', type: 'image/png', colorScheme: 'light'},
          {srcSet: 'bar.png', colorScheme: 'dark', media: '(width >= 500px)'},
          {srcSet: 'default.png'}
        ]} />
    );

    let img = getByRole('img');
    let picture = img.parentElement!;
    expect(picture.tagName).toBe('PICTURE');
    let sources = picture.querySelectorAll('source');

    expect(sources).toHaveLength(3);
    expect(sources[0]).toHaveAttribute('srcset', 'foo.png');
    expect(sources[0]).toHaveAttribute('type', 'image/png');
    expect(sources[0]).toHaveAttribute('media', '(prefers-color-scheme: light)');
    expect(sources[1]).toHaveAttribute('srcset', 'bar.png');
    expect(sources[1]).toHaveAttribute('media', '(width >= 500px) and (prefers-color-scheme: dark)');
    expect(sources[2]).toHaveAttribute('srcset', 'default.png');
  });

  it('should support conditional sources with Provider colorScheme override', async () => {
    let {getByRole} = render(
      <Provider colorScheme="dark">
        <Image
          alt="test"
          src={[
            {srcSet: 'foo.png', type: 'image/png', colorScheme: 'light'},
            {srcSet: 'bar.png', colorScheme: 'dark', media: '(width >= 500px)'},
            {srcSet: 'default.png'}
          ]} />
      </Provider>
    );

    let img = getByRole('img');
    let picture = img.parentElement!;
    expect(picture.tagName).toBe('PICTURE');
    let sources = picture.querySelectorAll('source');

    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('srcset', 'bar.png');
    expect(sources[0]).toHaveAttribute('media', '(width >= 500px)');
    expect(sources[1]).toHaveAttribute('srcset', 'default.png');
  });
});
