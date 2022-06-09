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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import Error from '@spectrum-icons/illustrations/src/Error';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '../';
import {Link} from '@react-spectrum/link';
import NoSearchResults from '@spectrum-icons/illustrations/src/NoSearchResults';
import NotFound from '@spectrum-icons/illustrations/src/NotFound';
import React from 'react';
import Timeout from '@spectrum-icons/illustrations/Timeout';
import Unauthorized from '@spectrum-icons/illustrations/Unauthorized';
import Unavailable from '@spectrum-icons/illustrations/Unavailable';
import Upload from '@spectrum-icons/illustrations/Upload';

type IllustratedMessageStory = ComponentStoryObj<typeof IllustratedMessage>;

let meta = {
  title: 'IllustratedMessage',
  component: IllustratedMessage
} as ComponentMeta<typeof IllustratedMessage>;

export default meta;

export const _NotFound: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <NotFound />
        <Heading>Error 404: Page not found</Heading>
        <Content>This page isn’t available. Try checking the URL or visit a different page.</Content>
      </>
    )
  },
  name: 'Not found'
};

export const _NoSearchResults: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <Heading>No matching results</Heading>
        <Content>Try another search.</Content>
        <NoSearchResults />
      </>
    )
  },
  name: 'No search results'
};

export const _Unauthorized: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <Content>You don’t have access to this page. Try checking the URL or visit a different page.</Content>
        <Unauthorized />
        <Heading>Error 401: Unauthorized</Heading>
      </>
    )
  }
};

export const _Error: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <Error />
        <Heading>Error 500: Internal Server Error</Heading>
        <Content>This page isn’t available right now. Try visiting this page again later.</Content>
      </>
    )
  }
};

export const _Unavailable: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <Unavailable />
        <Heading>Error 503: Service Unavailable</Heading>
        <Content>This page isn’t available right now. Try visiting this page again later.</Content>
      </>
    )
  }
};

export const _Timeout: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <Timeout />
        <Heading>Error 504: Gateway Timeout</Heading>
        <Content>This page isn’t available right now. Try visiting this page again later.</Content>
      </>
    )
  }
};

export const _Upload: IllustratedMessageStory = {
  args: {
    children: (
      <>
        <Upload />
        <Heading>Drag and drop your file</Heading>
        <Content>
          <Link>Select a file</Link> from your computer
          <br />
          or <Link>search Adobe Stock</Link>.
        </Content>
      </>
    )
  }
};

export const NoHeadingOrDescription: IllustratedMessageStory = {
  args: {
    children: (<NotFound aria-label="No Results" />)
  },
  name: 'No heading or description'
};
