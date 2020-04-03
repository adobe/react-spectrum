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

import {ActionButton} from '@react-spectrum/button';
import {cssModuleToSlots} from '@react-spectrum/utils';
import {Divider} from '@react-spectrum/divider';
import {Flex, Grid} from '@react-spectrum/layout';
import {Footer, View} from '@react-spectrum/view';
import {GridProps} from '@react-types/layout';
import {Heading} from '@react-spectrum/typography';
import {Image} from '@react-spectrum/image';
import More from '@spectrum-icons/workflow/More';
import React from 'react';
import {storiesOf} from '@storybook/react';
import styles from './styles.css';

// TODO: make some stories, live a little
storiesOf('Layout', module)
  .add(
    'Grid: card',
    () => render({
      slots: cssModuleToSlots(styles),
      children: null
    })
  );

function render(props: GridProps) {
  return (
    <Grid {...props} UNSAFE_className={styles['spectrum-Card']}>
      <Image slot="preview" objectFit="cover" src="https://scontent-sjc3-1.cdninstagram.com/vp/061c1b0fa69e3f36c24710f8d5603655/5E500437/t51.2885-15/sh0.08/e35/s640x640/72625830_117633199385660_495143751973844448_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com&_nc_cat=108" alt="" />
      <Image slot="avatar" src="https://a5.behance.net/a9758425f0eaa6f4064d20ba73dfb7946a48f067/img/profile/no-image-138.png?cb=264615658" alt="" />
      <View slot="title">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>Thor Odinson</Heading>
          <ActionButton isQuiet><More /></ActionButton>
        </Flex>
      </View>
      <Divider size="S" />
      <Footer>Got lost in the Lost Coast, trying to find home up there. Heimdall, if you see this post, send the Bifrost!</Footer>
    </Grid>
  );
}
