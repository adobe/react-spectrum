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

import {action} from '@storybook/addon-actions';
import {Breadcrumbs} from '../';
// import {Heading} from '@react-spectrum/text';
import {Item} from '@react-stately/collections';
import React from 'react';

let styles = {
  width: '100vw'
};
const CenterDecorator = (storyFn) => (
  <div style={styles}>
    <div>{storyFn()}</div>
  </div>
);

export default {
  title: 'Breadcrumbs',
  decorators: [CenterDecorator],

  parameters: {
    providerSwitcher: {status: 'negative'}
  }
};

export const DefaultWith3Items = () => render();

DefaultWith3Items.story = {
  name: 'Default (with 3 items)'
};

export const DefaultWith7Items = () => renderMany({});

DefaultWith7Items.story = {
  name: 'Default (with 7 items)'
};

export const IsMultiline = () => render({isMultiline: true});

IsMultiline.story = {
  name: 'isMultiline'
};

export const SizeS = () => render({size: 'S'});

SizeS.story = {
  name: 'size: S'
};

export const SizeSIsMultiline = () => render({size: 'S', isMultiline: true});

SizeSIsMultiline.story = {
  name: 'size: S, isMultiline'
};

export const SizeM = () => render({size: 'M'});

SizeM.story = {
  name: 'size: M'
};

export const SizeMIsMultiline = () => render({size: 'M', isMultiline: true});

SizeMIsMultiline.story = {
  name: 'size: M, isMultiline'
};

export const Truncated = () => (
  <div style={{width: '120px'}}>{render({})}</div>
);

Truncated.story = {
  name: 'truncated'
};

export const TruncatedIsMultiline = () => (
  <div style={{width: '100px'}}>{render({isMultiline: true})}</div>
);

TruncatedIsMultiline.story = {
  name: 'truncated, isMultiline'
};

export const ManyItemsShowRootTrue = () => renderMany({showRoot: true});

ManyItemsShowRootTrue.story = {
  name: 'many items, showRoot: true'
};

export const ManyItemsIsMultiline = () => renderMany({isMultiline: true});

ManyItemsIsMultiline.story = {
  name: 'many items, isMultiline'
};

export const ManyItemsIsMultilineShowRootTrue = () =>
  renderMany({maxVisibleItems: 'auto', isMultiline: true, showRoot: true});

ManyItemsIsMultilineShowRootTrue.story = {
  name: 'many items, isMultiline, showRoot: true'
};

export const IsDisabledTrue = () => render({isDisabled: true});

IsDisabledTrue.story = {
  name: 'isDisabled: true'
};

export const IsDisabledTrueIsMultiline = () =>
  render({isDisabled: true, isMultiline: true});

IsDisabledTrueIsMultiline.story = {
  name: 'isDisabled: true, isMultiline'
};

export const Resizeable = () => (
  <div
    style={{
      minWidth: '100px',
      width: '300px',
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderMany({})}
  </div>
);

Resizeable.story = {
  name: 'resizeable'
};

export const OnlyOneItem = () => (
  <Breadcrumbs>
    <Item>Root</Item>
  </Breadcrumbs>
);

OnlyOneItem.story = {
  name: 'Only one item'
};

export const OnlyOneItemIsMultiline = () => (
  <Breadcrumbs isMultiline>
    <Item>Root</Item>
  </Breadcrumbs>
);

OnlyOneItemIsMultiline.story = {
  name: 'Only one item, isMultiline'
};

function render(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item key="Folder 1">The quick brown fox jumps over</Item>
      <Item key="Folder 2">My Documents</Item>
      <Item key="Folder 3">Kangaroos jump high</Item>
    </Breadcrumbs>
  );
}

// function renderHeading(props = {}) {
//   return (
//     <Breadcrumbs {...props} onAction={action('onAction')}>
//       <Item key="Folder 1">
//         The quick brown fox jumps over
//       </Item>
//       <Item key="Folder 2">
//         My Documents
//       </Item>
//       <Item key="Folder 3">
//         <Heading level={1}>
//           Kangaroos jump high
//         </Heading>
//       </Item>
//     </Breadcrumbs>
//   );
// }

function renderMany(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item key="Folder 1">The quick brown fox jumps over</Item>
      <Item key="Folder 2">My Documents</Item>
      <Item key="Folder 3">Kangaroos jump high</Item>
      <Item key="Folder 4">Koalas are very cute</Item>
      <Item key="Folder 5">Wombat's noses</Item>
      <Item key="Folder 6">Wattle trees</Item>
      <Item key="Folder 7">April 7</Item>
    </Breadcrumbs>
  );
}
