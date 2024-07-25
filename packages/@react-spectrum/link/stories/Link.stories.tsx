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

import {ArgTypes, ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Link} from '../';
import React from 'react';
import {SpectrumLinkProps} from '@react-types/link';

type LinkStory = ComponentStoryObj<typeof Link>;

export default {
  title: 'Link',
  component: Link,
  argTypes: {
    onPress: {
      action: 'press'
    },
    onPressStart: {
      action: 'pressstart'
    },
    onPressEnd: {
      action: 'pressend'
    }
  }
} as ComponentMeta<typeof Link>;

export let Default: LinkStory = {
  args: {children: 'This is a React Spectrum Link'}
};

export let Secondary: LinkStory = {
  ...Default,
  args: {...Default.args, variant: 'secondary'},
  name: 'variant: secondary'
};

export let OverBackground: LinkStory = {
  ...Default,
  args: {...Default.args, variant: 'overBackground'},
  decorators: [
    (Story) => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        <Story />
      </div>
    )
  ],
  name: 'variant: overBackground'
};

export let IsQuiet: LinkStory = {
  ...Default,
  args: {...Default.args, isQuiet: true},
  name: 'isQuiet: true'
};

export let IsQuietSecondary: LinkStory = {
  ...Default,
  args: {...IsQuiet.args, ...Secondary.args},
  name: 'isQuiet: true, variant: secondary'
};

export let WithHref: LinkStory = {
  ...Default,
  args: {...Default.args, href: '//example.com'},
  name: 'href'
};

export let WithChildren: LinkStory = {
  ...Default,
  args: {children: <a href="//example.com" target="_self">This is a React Spectrum Link</a>},
  name: 'children: a'
};

export let BlockNavigation: LinkStory = {
  args: {children: <a href="//example.com" target="_self" onClick={(e) => e.preventDefault()}>This is a React Spectrum Link</a>}
};

export let OnClick: LinkStory = {
  ...Default,
  args: {...Default.args},
  argTypes: {
    onClick: {
      action: 'deprecatedOnClick'
    }
  } as Partial<ArgTypes<SpectrumLinkProps>> & {onClick: any},
  name: 'onClick'
};
