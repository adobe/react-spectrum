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

import {Link} from 'react-aria-components';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/Link',
  component: Link
} as Meta<typeof Link>;

export type LinkStory = StoryFn<typeof Link>;

export const LinkExample: LinkStory = () => {
  return (
    <Link data-testid="link-example" href="https://www.imdb.com/title/tt6348138/" hrefLang="en"  target="_blank">
      The missing link
    </Link>
  );
};
