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

import {expect} from '@storybook/jest';
import {Menu, MenuItem, SearchField} from '../src';
import type {Meta} from '@storybook/react';
import {Autocomplete as RACAutocomplete, useFilter} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {userEvent, waitFor, within} from '@storybook/testing-library';

const meta: Meta<typeof Menu<any>> = {
  component: Menu,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Autocomplete'
};

export default meta;

function Autocomplete(props) {
  let {contains} = useFilter({sensitivity: 'base'});
  return (
    <RACAutocomplete filter={contains} {...props} />
  );
}

function AutocompleteStory() {
  return (
    <Autocomplete>
      <SearchField label="Search" styles={style({marginTop: 12, marginX: 12})} />
      <Menu aria-label="test menu" styles={style({marginTop: 12})}>
        <MenuItem>Foo</MenuItem>
        <MenuItem>Bar</MenuItem>
        <MenuItem>Baz</MenuItem>
      </Menu>
    </Autocomplete>
  );
}

export const CutPaste: StoryObj<typeof AutocompleteStory> = {
  render: () => <AutocompleteStory />,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('Foo');
    let body = canvasElement.ownerDocument.body;
    let seachfield = await within(body).findByRole('searchbox');
    await waitFor(() => {
      expect(seachfield).not.toHaveAttribute('data-focus-visible');
    }, {timeout: 5000});

    await userEvent.keyboard('{Control>}a{/Control}');
    await userEvent.cut();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(seachfield).not.toHaveAttribute('data-focus-visible');
    }, {timeout: 5000});

    await userEvent.paste();
    await waitFor(() => {
      expect(seachfield).toHaveAttribute('data-focus-visible');
    }, {timeout: 5000});
  }
};
