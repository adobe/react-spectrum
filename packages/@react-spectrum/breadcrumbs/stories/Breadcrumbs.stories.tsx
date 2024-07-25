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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
// import {Heading} from '@react-spectrum/text';
import {Item} from '@react-stately/collections';
import React from 'react';

let styles = {
  width: '100vw'
};
const CenterDecorator = storyFn => <div style={styles}><div>{storyFn()}</div></div>;

export type BreadcrumbsStory = ComponentStoryObj<typeof Breadcrumbs>;

export default {
  title: 'Breadcrumbs',
  component: Breadcrumbs,
  decorators: [storyFn => CenterDecorator(storyFn)],
  args: {
    onAction: action('onAction')
  },
  argTypes: {
    onAction: {
      table: {
        disable: true
      }
    },
    isMultiline: {
      control: 'boolean'
    },
    showRoot: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    autoFocusCurrent: {
      control: 'boolean'
    },
    size: {
      control: 'select',
      options: ['S', 'M', 'L']
    }
  }
} as ComponentMeta<typeof Breadcrumbs>;

export const Default: BreadcrumbsStory = {
  render: (args) => render(args),
  name: '3 items'
};

export const DefaultTruncated: BreadcrumbsStory = {
  render: (args) => (
    <div style={{width: '120px'}}>
      {render(args)}
    </div>
  ),
  name: 'truncated'
};

export const RenderMany: BreadcrumbsStory = {
  render: (args) => (
    <div style={{minWidth: '100px', width: '300px', padding: '10px', resize: 'horizontal', overflow: 'auto', backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
      {renderMany(args)}
    </div>
  ),
  name: '7 items, resizable container'
};

export const OneItem: BreadcrumbsStory = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <Item>Root</Item>
    </Breadcrumbs>
  ),
  name: '1 item'
};

export const Links: BreadcrumbsStory = {
  render: (args) => (
    <Breadcrumbs {...args}>
      <Item href="https://example.com">Example.com</Item>
      <Item href="https://example.com/foo">Foo</Item>
      <Item href="https://example.com/foo/bar">Bar</Item>
      <Item href="https://example.com/foo/bar/baz">Baz</Item>
      <Item href="https://example.com/foo/bar/baz/qux">Qux</Item>
    </Breadcrumbs>
  )
};

function render(props) {
  return (
    <Breadcrumbs {...props}>
      <Item key="Folder 1">The quick brown fox jumps over</Item>
      <Item key="Folder 2">My Documents</Item>
      <Item key="Folder 3">Kangaroos jump high</Item>
    </Breadcrumbs>
  );
}

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

// TODO: add back in when heading case is fixed?
// .add(
//   'last item Heading',
//   () => renderHeading()
// )
// .add(
//   'last item Heading, size: S',
//   () => renderHeading({size: 'S'})
// )
// .add(
//   'last item Heading, size: M',
//   () => renderHeading({size: 'M'})
// )
// .add(
//   'last item Heading, isMultiline',
//   () => renderHeading({isMultiline: true})
// )
// .add(
//   'last item Heading, size: S, isMultiline',
//   () => renderHeading({isMultiline: true, size: 'S'})
// )
// .add(
//   'last item Heading, size: M, isMultiline',
//   () => renderHeading({isMultiline: true, size: 'M'})
// )

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
