import {ActionButton} from '@react-spectrum/button';
import {Content, Header} from '@react-spectrum/view';
import {Divider} from '@react-spectrum/divider';
import {Flex, Grid} from '@react-spectrum/layout';
import {GridProps} from '@react-types/layout';
import {Heading} from '@react-spectrum/typography';
import {Image} from '@react-spectrum/image';
import More from '@spectrum-icons/workflow/More';
import React from 'react';
import {storiesOf} from '@storybook/react';
import styles from './styles.css';

// TODO: make some stories, live a little
storiesOf('Grid', module)
  .add(
    'name me',
    () => render({
      slots: styles,
      children: null
    })
  );

function render(props:GridProps) {
  return (
    <Grid {...props} UNSAFE_className={styles['spectrum-Card']}>
      <Image slot="preview" objectFit="cover" src="https://scontent-sjc3-1.cdninstagram.com/vp/061c1b0fa69e3f36c24710f8d5603655/5E500437/t51.2885-15/sh0.08/e35/s640x640/72625830_117633199385660_495143751973844448_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com&_nc_cat=108" alt="" />
      <Image slot="avatar" src="https://a5.behance.net/a9758425f0eaa6f4064d20ba73dfb7946a48f067/img/profile/no-image-138.png?cb=264615658" alt="" />
      <Header slot="title">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>Thor Odinson</Heading>
          <ActionButton isQuiet icon={<More />} />
        </Flex>
      </Header>
      <Divider size="S" />
      <Content slot="footer">Got lost in the Lost Coast, trying to find home up there. Heimdall, if you see this post, send the Bifrost!</Content>
    </Grid>
  );
}
